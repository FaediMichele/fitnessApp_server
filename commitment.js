var functions = require("./util.js");

const service = "commitment";

class commitment {
    constructor(store) {
        this.store = store;
        this.service = service;
        this.commitment = store.getTable("MyCommitment");
        this.step = store.getTable("MyStep");
        this.stepDone = store.getTable("MyStepDone");
        this.lastCommitmentId = functions.getBestInArray(this.commitment, "idCommitment", (id1, id2) => id1 - id2).idCommitment;
        this.lastStepId = functions.getBestInArray(this.step, "idMyStep", (id1, id2) => id1 - id2).idMyStep;
    }

    async manageGet(queryString) { }

    async managePost(body) {
        let idUser = this.store.getIdUser(body.idSession);
        if (body.method == "addCommitment" && body.data.commitment != undefined && Array.isArray(body.data.steps)) {
            this.lastCommitmentId++;
            this.commitment.push({
                idCommitment: this.lastCommitmentId,
                name: body.data.commitment.name, desc: body.data.commitment.desc, creationDate: new Date(), idUser: idUser
            });
            let ids = [];
            body.data.steps.forEach(e => {
                this.lastStepId++;
                this.step.push({
                    idMyStep: this.lastStepId, idCommitment: this.lastCommitmentId,
                    name: e.name, unitMeasure: e.unitMeasure, max: e.max, repetitionDay: e.repetitionDay, type: e.type
                });
                this.stepDone.push({ idMyStep: this.lastStepId, dateStart: new Date(), result: 0 });
                ids.push(this.lastStepId);
            });

            this.store.saveData("MyCommitment", this.commitment);
            this.store.saveData("MyStep", this.step);
            this.store.saveData("MyStepDone", this.stepDone);
            return { code: 200, response: { idCommitment: this.lastCommitmentId, idSteps: ids } };
        } else if(body.method == "deleteMyCommitment" && body.data.idCommitment != undefined) {
            this.commitment = this.commitment.filter(c => c.idCommitment != body.data.idCommitment);
            this.step = this.step.filter(s =>{
                if(s.idCommitment = body.idCommitment){
                    this.stepDone = this.stepDone.filter(sd => sd.idMyStep != s.idMyStep);
                    return false;
                }
                return true;
            });
            this.store.saveData("MyCommitment", this.commitment);
            this.store.saveData("MyStep", this.step);
            this.store.saveData("MyStepDone", this.stepDone);
            return { code: 200, response: '{message: "ok"}' };
        } else if (body.method == "updateMyStepDone" && body.data.idMyStep != undefined) {
            let max = undefined;
            let maxI = -1;
            for (let i = 0; i < this.stepDone; i++) {
                if (this.stepDone[i].idMyStep == body.data.idMyStep) {
                    if (max == undefined || this.stepDone[i].dateStart > max) {
                        max = this.stepDone[i].dateStart;
                        maxI = i;
                    }
                }
            }
            this.stepDone[maxI].result = parseInt(body.data.result);
            this.store.saveData("MyStepDone", this.stepDone);
            return { code: 200, response: '{message: "ok"}' };
        } else if (body.method == "addMyStepDone" && body.data.idMyStep != undefined) {
            if (this.store.searchKey("MyStep", "idMyStep", body.data.idMyStep) != undefined) {
                this.stepDone.push({ idUser: idUser, dateStart: new Date(), result: 0 });
                this.store.saveData("MyStepDone", this.stepDone);
                return { code: 200, response: '{message: "ok"}' };
            }
            return { code: 400, response: '{message: "step no found"}' };
        }
        return { code: 400, response: '{message: "param was wrong"}' };
    }
}

module.exports = commitment