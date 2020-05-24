var functions = require("./util.js");

const service = "exerciseInProgress";

class exerciseInProgress {
    constructor(store) {
        this.store = store;
        this.service = service;
        this.exerciseInProgress = this.store.getTable("ExerciseInProgress");
    }

    async manageGet(queryString) { }

    async managePost(body) {
        let idUser = this.store.getIdUser(body.idSession);
        if (body.method == "insertExerciseInProgress") {
            let ok = true;
            let result = [];
            let add = (d) => {
                if (d.idExercise != undefined && this.store.searchKey("Exercise", "idExercise", d.idExercise) != undefined &&
                    functions.searchObjectInArray(this.exerciseInProgress, d.idExercise, "idExercise") == undefined) {
                    result.push({ idUser: idUser, idExercise: d.idExercise, progression: 0, numStep: 1, lastEdit: new Date() });
                } else {
                    ok = false;
                }
            };

            if (Array.isArray(body.data)) {
                body.data.forEach(add);
            } else {
                add(body.data)
            }
            if (!ok) {
                return { code: 400, response: '{message: "bad request. param was wrong"}' };
            }
            this.exerciseInProgress = this.exerciseInProgress.concat(result);
            this.store.saveData("ExerciseInProgress", this.exerciseInProgress);
            return { code: 200, response: '{message: "ok"}' };
        } else if (body.method == "updateExerciseInProgress") {
            let ok = true;
            let update = (e) => {
                let i = functions.getNumItemInArray(this.exerciseInProgress, ["idUser", "idExercise"], [idUser, e.idExercise]);
                if (e.progression != undefined) {
                    this.exerciseInProgress[i].progression = parseInt(e.progression);
                }
                if (e.numStep != undefined) {
                    this.exerciseInProgress[i].numStep = parseInt(e.numStep);
                }
                this.exerciseInProgress[i].lastEdit = new Date();

            };
            if (Array.isArray(body.data)) {
                body.data.forEach(update);
            } else {
                update(body.data)
            }
            if (!ok) {
                return { code: 400, response: '{message: "bad request. param was wrong"}' };
            }
            this.store.saveData("ExerciseInProgress", this.exerciseInProgress);
            return { code: 200, response: '{message: "ok"}' };
        } else if (body.method == "deleteExerciseInProgress") {
            let del = (e) => {
                this.exerciseInProgress = this.exerciseInProgress.filter(a => a.idUser != idUser || a.idExercise == e.idExercise);
            };
            if (Array.isArray(body.data)) {
                body.data.forEach(del);
            } else {
                del(body.data)
            }
            this.store.saveData("ExerciseInProgress", this.exerciseInProgress);
            return { code: 200, response: '{message: "ok"}' };
        }
    }
}

module.exports = exerciseInProgress