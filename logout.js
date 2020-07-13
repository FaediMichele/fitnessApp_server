var functions = require("./util.js");

const service = "logout";

class logout {
    constructor(store) {
        this.store = store;
        this.service = service;
        this.users = this.store.getTable("User");
        this.levels = this.store.getTable("Level");
        this.inscriptions = this.store.getTable("Inscription");
        this.schools = this.store.getTable("School");
        this.courses = this.store.getTable("Course");
        this.review = store.getTable("Review");
        this.history = store.getTable("History");
        this.friendship = store.getTable("Friendship");
        this.message = store.getTable("Message");
        this.coursesBought = this.store.getTable("CourseBought");
        this.exerciseInProgress = this.store.getTable("ExerciseInProgress");
        this.commitment = store.getTable("MyCommitment");
        this.steps = store.getTable("MyStep");
        this.stepDone = store.getTable("MyStepDone");
        this.lastCommitmentId = functions.getBestInArray(
            this.commitment,
            "idCommitment",
            (id1, id2) => id1 - id2
        ).idCommitment;
        this.lastStepId = functions.getBestInArray(this.steps, "idMyStep", (id1, id2) => id1 - id2).idMyStep;
        this.lastFriendshipId = functions.getBestInArray(
            this.friendship,
            "idFriendship",
            (id1, id2) => id1 - id2
        ).idFriendship;
        this.lastIdSchool = functions.getBestInArray(this.schools, "idSchool", (id1, id2) => id1 - id2).idSchool;
        this.lastIdCourse = functions.getBestInArray(this.courses, "idCourse", (id1, id2) => id1 - id2).idCourse;
    }

    async manageGet(queryString) {}

    async managePost(body) {
        let idUser = this.store.getIdUser(body.idSession);
        body.data = JSON.parse(body.data);
        let newIdMap = {};
        if (idUser != undefined && body.data != undefined) {
            body = body.data;
            this.updateMyCommitment(idUser, body, newIdMap);
            this.updateLevel(idUser, body, newIdMap);
            this.updateMyStep(idUser, body, newIdMap);
            this.updateMyStepDone(idUser, body, newIdMap);
            console.log("ok");
            return { code: 200, response: '{message: "ok"}' };
        }
        return {
            code: 404,
            response: '{message: "Logout failed. Param was wrong"}',
        };
    }

    updateLevel(idUser, body, newIdMap) {
        if (body.Level.length > 0) {
            let levelsNew = body.Level.filter((l) => l.idUser == idUser);
            for (let j = 0; j < levelsNew.length; j++) {
                for (let i = 0; i < this.levels.length; i++) {
                    if (this.levels[i].idUser == idUser && this.levels[i].cat == levelsNew[j].cat) {
                        if (levelsNew[j].PE != this.levels[i].PE) {
                            this.levels[i].PE = levelsNew[j].PE;
                        }
                        if (levelsNew[j].level != this.levels[i].level) {
                            this.levels[i].level = levelsNew[j].level;
                        }
                    }
                }
            }
            this.store.saveData("Level", this.levels);
        }
    }

    updateMyCommitment(idUser, body, newIdMap) {
        console.log(body);
        if (body.MyCommitment.length > 0) {
            let comms = body.MyCommitment.filter((c) => c.idUser == idUser);
            for (let i = 0; i < comms.length; i++) {
                if (comms[i].idCommitment < 0) {
                    if (newIdMap.MyCommitment == undefined) {
                        newIdMap.MyCommitment = [];
                    }
                    this.lastCommitmentId++;
                    newIdMap.MyCommitment[comms[i].idCommitment] = this.lastCommitmentId;
                    comms[i].idCommitment = newIdMap.MyCommitment[comms[i].idCommitment];
                }
            }
            this.commitment = this.commitment.filter((c) => c.idUser != idUser).concat(comms);
            this.store.saveData("MyCommitment", this.commitment);
        }
    }

    // require MyCommitment
    updateMyStep(idUser, body, newIdMap) {
        if (body.MyStep.length > 0) {
            let steps = body.MyStep;
            for (let i = 0; i < steps.length; i++) {
                if (
                    this.checkNotNull(steps[i].idMyStep) &&
                    this.checkNotNull(steps[i].name) &&
                    this.checkNotNull(steps[i].unitMeasure) &&
                    this.checkNotNull(steps[i].max) &&
                    this.checkNotNull(steps[i].repetitionDay) &&
                    this.checkNotNull(steps[i].type)
                ) {
                    if (steps[i].idCommitment < 0) {
                        steps[i].idCommitment = newIdMap.MyCommitment[steps[i].idCommitment];
                        if (steps[i].idCommitment == undefined) {
                            continue;
                        }
                        // new commitment also means new step
                        if (newIdMap.MyStep == undefined) {
                            newIdMap.MyStep = [];
                        }
                        newIdMap.MyStep[steps[i].idMyStep] = ++this.lastStepId;
                        steps[i].idMyStep = newIdMap.MyStep[steps[i].idMyStep];
                        this.steps.push({
                            idMyStep: steps[i].idMyStep,
                            idCommitment: steps[i].idCommitment,
                            name: steps[i].name,
                            unitMeasure: steps[i].unitMeasure,
                            max: steps[i].max,
                            repetitionDay: steps[i].repetitionDay,
                            type: steps[i].type,
                        });
                    } else {
                        let j = 0;
                        for (; j < this.steps.length; j++) {
                            if (this.steps[j].idMyStep == steps[i].idMyStep) {
                                this.steps[j].name = steps[i].name;
                                this.steps[j].unitMeasure = steps[i].unitMeasure;
                                this.steps[j].max = steps[i].max;
                                this.steps[j].repetitionDay = steps[i].repetitionDay;
                                this.steps[j].type = steps[i].type;
                                break;
                            }
                        }
                    }
                }
            }
            this.store.saveData("MyStep", this.steps);
        }
    }

    // require stepdone
    updateMyStepDone(idUser, body, newIdMap) {
        let stepDone = body.MyStepDone;
        let newId = [];
        for (let i = 0; i < stepDone.length; i++) {
            if (stepDone[i].idMyStep < 0) {
                stepDone[i].idMyStep = newIdMap.MyStep[stepDone[i].idMyStep];
                if (!this.checkNotNull(stepDone[i].idMyStep)) {
                    continue;
                }
            }
            newId.push(stepDone[i].idMyStep);
        }
        this.stepDone = this.stepDone
            .filter((s) => !newId.includes(s.idMyStep))
            .concat(stepDone.filter((s) => this.checkNotNull(s.idMyStep)));
        this.store.saveData("MyStepDone", this.stepDone);
    }

    checkNotNull(val) {
        return val != undefined && val != null && val != "";
    }

    getNumUserById(idUser) {
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].idUser == idUser) {
                return i;
            }
        }
        return undefined;
    }

    getNumLevelById(idUser, cat) {
        for (let i = 0; i < this.levels.length; i++) {
            if (this.levels[i].idUser == idUser && this.levels[i].cat == cat) {
                return i;
            }
        }
        return undefined;
    }
}

module.exports = logout;
