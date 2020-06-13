var functions = require("./util.js");

const service = "history";

class history {
    constructor(store) {
        this.store = store;
        this.service = service;
        this.history = store.getTable("History");
    }

    async manageGet(queryString) { }

    async managePost(body) {
        let idUser = this.store.getIdUser(body.idSession);
        if (body.method == "addHistory") {
            let add = h => {
                if (this.store.searchKey("Exercise", "idExercise", h.idExercise) != undefined) {
                    this.history.push({ idUser: idUser, date: new Date(), idExercise: h.idExercise });
                }
            }
            if (Array.isArray(body.data)) {
                body.data.array.forEach(add);
            } else {
                add(body.data);
            }
            this.store.saveData("History", this.history);
        }
    }
}

module.exports = history