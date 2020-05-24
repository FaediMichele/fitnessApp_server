var functions = require("./util.js");

const service = "friend";

class friend {
    constructor(store) {
        this.store = store;
        this.service = service;
        this.friendship = store.getTable("Friendship");
        this.message = store.getTable("Message");
        this.lastFriendshipId = functions.getBestInArray(this.friendship, "idFriendship", (id1, id2) => id1 - id2).idFriendship;
    }

    async manageGet(queryString) { }

    async managePost(body) {
        let idUser = this.store.getIdUser(body.idSession);
        if (body.method == "addFriend" && body.data.idFriend != undefined) {
            this.lastFriendshipId++;
            if (this.store.searchKey("User", "idUser", body.data.idFriend) != undefined) {
                this.friendship.push({ idFriendship: this.lastFriendshipId, idUser1: idUser, idUser2: body.data.idFriend });
            } else {
                return { code: 400, response: '{message: "bad request. idUserNotFound"}' };
            }
            this.store.saveData("Friendship", this.friendship);
            return { code: 200, response: this.lastFriendshipId };
        } else if (body.method == "addMessage" && body.data.idFriendship != undefined && body.data.message != undefined) {
            let tmp = this.store.searchKey("Frienship", "idFriendship", body.data.idFriendship)
            let otherId = tmp.idUser1 == idUser ? tmp.idUser2 : tmp.idUser1;
            this.message.push({ idFriendship: body.data.idFriendship, date: new Date(), message: body.data.message, idSender: idUser, idReceiver: otherId });
            this.store.saveData("Message", this.message);
            return { code: 200, response: '{message: "ok"}' };
        }
    }
}

module.exports = friend