var functions = require("./util.js");

const service = "review";

class review {
    constructor(store) {
        this.store = store;
        this.service = service;
        this.review = store.getTable("Review");
    }

    async manageGet(queryString) { }

    async managePost(body) {
        let idUser = this.store.getIdUser(body.idSession);
        if (body.method == "addReview") {
            let add = h => {
                if (this.store.searchKey("School", "idSchool", h.idSchool)) {
                    this.history.push({ idUser: idUser, val: h.val, comment: h.comment, idSchool: h.idSchool });
                }
            }
            if (Array.isArray(body.data)) {
                body.data.array.forEach(add);
            } else {
                add(body.data);
            }
            this.store.saveData("Review", this.review);
        }
    }
}

module.exports = review