var functions = require("./util.js");

const service = "friend";

class friend {
    constructor(store) {
        this.store = store;
        this.service = service;
        this.friendship = store.getTable("Friendship");
        this.friendshipRequest = store.getTable("FriendshipRequest");
        this.message = store.getTable("Message");
        this.lastFriendshipId = functions.getBestInArray(
            this.friendship,
            "idFriendship",
            (id1, id2) => id1 - id2
        ).idFriendship;
    }

    async manageGet(queryString) {}

    async managePost(body) {
        let idUser = this.store.getIdUser(body.idSession);
        if (body.method == "addFriend" && body.data.idFriend != undefined) {
            // deprecated by requestFriendship
            this.lastFriendshipId++;
            if (this.store.searchKey("User", "idUser", body.data.idFriend) != undefined) {
                this.friendship.push({
                    idFriendship: this.lastFriendshipId,
                    idUser1: idUser,
                    idUser2: body.data.idFriend,
                });
            } else {
                return { code: 400, response: '{message: "bad request. idUserNotFound"}' };
            }
            this.store.saveData("Friendship", this.friendship);
            return { code: 200, response: this.lastFriendshipId };
        } else if (
            body.method == "addMessage" &&
            body.data.idFriendship != undefined &&
            body.data.message != undefined
        ) {
            let tmp = this.store.searchKey("Friendship", "idFriendship", body.data.idFriendship);
            if (tmp == undefined) {
                return { code: 400, response: '{message: "bad request. idFriendship NotFound"}' };
            }
            tmp = this.friendship[tmp];
            let otherId = tmp.idUser1 == idUser ? tmp.idUser2 : tmp.idUser1;
            console.log(tmp);
            this.message.push({
                idFriendship: body.data.idFriendship,
                date: new Date(),
                message: body.data.message,
                idSender: idUser,
                idReceiver: otherId,
            });
            this.store.saveData("Message", this.message);
            return { code: 200, response: '{message: "ok"}' };
        } else if (body.method == "getMessage" && body.data.lastDate != undefined && body.data.idFriendship) {
            let tmp = this.store.searchKey("Friendship", "idFriendship", body.data.idFriendship);
            if (tmp == undefined) {
                return { code: 400, response: '{message: "bad request. idFriendship NotFound"}' };
            }
            tmp = this.friendship[tmp];
            if (tmp.idUser1 != idUser && tmp.idUser2 != idUser) {
                return { code: 400, response: '{message: "bad request. idFriendship not correct"}' };
            }

            let result = this.message.filter((m) => {
                return m.idFriendship == body.data.idFriendship && new Date(m.date).getTime() > body.data.lastDate;
            });
            let maxDate = body.data.lastDate;
            console.log(result);
            for (let i = 0; i < result.length; i++) {
                result[i].date = new Date(result[i].date);
                if (result[i].date.getTime() > maxDate) {
                    maxDate = result[i].date.getTime();
                }
            }
            console.log(body.data);
            return { code: 200, response: { lastDate: maxDate, Message: result } };
        } else if (
            body.method == "requestFriendship" &&
            body.data.idReceiver != undefined &&
            body.data.idReceiver != ""
        ) {
            let tmp = this.friendshipRequest.filter(
                (r) => r.idReceiver == body.data.idReceiver && r.idSender == idUser
            )[0];
            if (tmp != undefined) {
                return { code: 400, response: '{message: "request already done"}' };
            }
            tmp = this.friendshipRequest.filter((r) => r.idReceiver == idUser && r.idSender == body.data.idReceiver)[0];
            if (tmp == undefined) {
                // new request
                let newRequest = { idSender: idUser, idReceiver: body.data.idReceiver };
                this.friendshipRequest.push(newRequest);
                this.store.saveData(this.friendshipRequest);
                return { code: 200, response: '{message: "ok"}' };
            } else {
                // request accepted
                this.friendshipRequest = this.friendshipRequest.filter(
                    (r) => r.idReceiver != idUser && r.idSender != body.data.idReceiver
                );
                this.store.saveData(this.friendshipRequest);

                this.lastFriendshipId++;

                this.friendship.push({
                    idFriendship: this.lastFriendshipId,
                    idUser1: idUser,
                    idUser2: body.data.idReceiver,
                });

                this.store.saveData("Friendship", this.friendship);

                return { code: 200, response: '{message: "ok"}' };
            }
        } else if (body.method == "blockUser" && body.data.idFriend != undefined && body.data.idFriend != "") {
            this.friendship = this.friendship.filter(
                (f) =>
                    !(
                        (f.idUser1 == idUser && f.idUser2 == body.data.idFriend) ||
                        (f.idUser2 == idUser && f.idUser1 == body.data.idFriend)
                    )
            );
            this.store.saveData("Friendship", this.friendship);
            return { code: 200, response: '{message: "ok"}' };
        }
        return { code: 400, response: '{message: "method not found"}' };
    }
}

module.exports = friend;
