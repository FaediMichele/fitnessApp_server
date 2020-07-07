const functions = require("./util.js");
const distance = require("ukkonen");

const service = "search";

class search {
    constructor(store) {
        this.store = store;
        this.service = service;
        this.user = store.getTable("User");
        this.commitment = store.getTable("MyCommitment");
        this.step = store.getTable("MyStep");
        this.friendship = store.getTable("Friendship");
        this.friendRequest = store.getTable("FriendshipRequest");
        this.accuracity = 2;

        this.user;
    }

    async manageGet(queryString, res) {
        console.log("HERE ");
        if (
            queryString.text != undefined &&
            queryString.text != "" &&
            queryString.idUser != undefined &&
            queryString.idUser != ""
        ) {
            let userCopy = JSON.parse(JSON.stringify(this.user));
            let commitmentCopy = JSON.parse(JSON.stringify(this.commitment));
            let stepCopy = JSON.parse(JSON.stringify(this.step));
            let userResponse = userCopy.map((u) => {
                return { val: u, distance: this.myDistance(u.firstname, queryString.text) };
            });
            userResponse = userResponse
                .concat(
                    userCopy.map((u) => {
                        u.type = "User";
                        return { val: u, distance: this.myDistance(u.email, queryString.text) };
                    })
                )
                .filter((v) => v.distance <= this.accuracity);

            let commitmentResponse = commitmentCopy
                .map((u) => {
                    let user = userCopy[this.store.searchKey("User", "idUser", u.idUser)];
                    let iterator = Object.keys(user);
                    for (const key of iterator) {
                        u[key] = user[key];
                    }
                    u.type = "MyCommitment";
                    return { val: u, distance: this.myDistance(u.name, queryString.text) };
                })
                .filter((v) => v.distance <= this.accuracity);
            let stepResponse = stepCopy
                .map((u) => {
                    let distance = this.myDistance(u.name, queryString.text);
                    console.log(distance, u.name);
                    if (distance <= this.accuracity) {
                        let com = commitmentCopy[this.store.searchKey("MyCommitment", "idCommitment", u.idCommitment)];
                        let iterator = Object.keys(com);
                        u.nameStep = u.name;
                        for (const key of iterator) {
                            u[key] = com[key];
                        }
                        u.nameCommitment = u.name;
                        delete u.name;

                        let user = userCopy[this.store.searchKey("User", "idUser", u.idUser)];
                        iterator = Object.keys(user);
                        for (const key of iterator) {
                            u[key] = user[key];
                        }
                        u.type = "MyStep";
                    }
                    return { val: u, distance: distance };
                })
                .filter((v) => v.distance <= this.accuracity);

            let offset = 0;
            let num = 30;
            if (queryString.offset != undefined && parseInt(queryString.offset) >= 0) {
                offset = parseInt(queryString.offset);
            }

            if (queryString.num != undefined && parseInt(queryString.num) > 0) {
                num = parseInt(queryString.num);
            }
            if (userResponse == undefined) {
                userResponse = [];
            }
            if (commitmentResponse == undefined) {
                commitmentResponse = [];
            }
            if (stepResponse == undefined) {
                stepResponse = [];
            }
            let total = userResponse
                .concat(commitmentResponse)
                .concat(stepResponse)
                .filter((v) => v.val.idUser != queryString.idUser);
            total.forEach((e) => {
                delete e.hashPassword;
            });

            // for the non friend result increase the distance in order to have them at the bottom
            for (let i = 0; i < total.length; i++) {
                let isFriend = this.friendship.filter(
                    (f) =>
                        (f.idUser1 == queryString.idUser1 && f.idUser2 == total[i].val.idUser) ||
                        (f.idUser2 == queryString.idUser1 && f.idUser1 == total[i].val.idUser)
                );
                if (isFriend == undefined || isFriend.length == 0) {
                    total[i].distance += this.accuracity * 2;
                    let requestSended = this.friendRequest.filter(
                        (f) => f.idSender == queryString.idUser && f.idReceiver == total[i].val.idUser
                    );
                    let requestReceived = this.friendRequest.filter(
                        (f) => f.idSender == total[i].val.idUser && f.idReceiver == queryString.idUser
                    );
                    if (requestSended != undefined && requestSended.length > 0) {
                        total[i].val.requestSended = true;
                    }
                    if (requestReceived != undefined && requestReceived.length > 0) {
                        total[i].val.requestReceived = true;
                    }
                    console.log("Request received: ", requestReceived);
                } else {
                    total[i].val.isFriend = true;
                }
            }
            total = total
                .sort((a, b) => b.distance - a.distance)
                .slice(offset, offset + num)
                .map((e) => e.val);
            console.log("result" + total);
            return { code: 200, response: total };
        } else {
            console.log("error on request");
            return { code: 200, response: '{message: "error on request"}' };
        }
    }

    myDistance(p1, p2) {
        let p1vet = p1.split(" ");
        let p2vet = p2.split(" ");
        let min = 2 ^ 53;
        let tmp;
        for (let i = 0; i < p1vet.length; i++) {
            for (let j = 0; j < p2vet.length; j++) {
                if (
                    p1vet[i].length <= this.accuracity ||
                    p2vet[j].length <= this.accuracity ||
                    p1vet[i].length < p2vet[j].length
                ) {
                    continue;
                }
                tmp = distance(p1vet[i], p2vet[j]);
                if (tmp > this.accuracity) {
                    continue;
                }
                if (tmp < min) {
                    min = tmp;
                }
            }
        }
        return min;
    }

    async managePost(body) {
        return { code: 400, response: '{"message": "Post not avaliable for search"}' };
    }
}

module.exports = search;
