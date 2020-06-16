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
    this.Courses = this.store.getTable("CourseBought");
    this.exerciseInProgress = this.store.getTable("ExerciseInProgress");
    this.commitment = store.getTable("MyCommitment");
    this.steps = store.getTable("MyStep");
    this.stepDone = store.getTable("MyStepDone");
    this.lastCommitmentId = functions.getBestInArray(
      this.commitment,
      "idCommitment",
      (id1, id2) => id1 - id2
    ).idCommitment;
    this.lastStepId = functions.getBestInArray(
      this.steps,
      "idMyStep",
      (id1, id2) => id1 - id2
    ).idMyStep;
    this.lastFriendshipId = functions.getBestInArray(
      this.friendship,
      "idFriendship",
      (id1, id2) => id1 - id2
    ).idFriendship;
    this.lastIdSchool = functions.getBestInArray(
      this.schools,
      "idSchool",
      (id1, id2) => id1 - id2
    ).idSchool;
    this.lastIdCourse = functions.getBestInArray(
      this.courses,
      "idCourse",
      (id1, id2) => id1 - id2
    ).idCourse;
  }

  async manageGet(queryString) {}

  async managePost(body) {
    let idUser = this.store.getIdUser(body.idSession);
    let newIdMap = [];
    if (idUser != undefined && body.data != undefined) {
    }
    return {
      code: 404,
      response: '{message: "Logout failed. Param was wrong"}',
    };
  }

  updateUser(idUser, body) {
    if (body.User.length > 0) {
      let usrNewData = body.User.filter((u) => u.idUser == idUser);
      let i = getNumUserById(idUser);
      if (usrNewData.email != this.users[i].email) {
        this.users[i].email = usrNewData.email;
      }
      if (usrNewData.surname != this.users[i].surname) {
        this.users[i].surname = usrNewData.surname;
      }
      if (usrNewData.firstname != this.users[i].firstname) {
        this.users[i].firstname = usrNewData.firstname;
      }
      if (usrNewData.hashPassword != this.users[i].hashPassword) {
        this.users[i].hashPassword = usrNewData.hashPassword;
      }
      this.store.saveData("User", this.users);
    }
  }

  updateLevel(idUser, body) {
    if (body.Level.length > 0) {
      let levelsNew = body.Level.filter((l) => l.idUser == idUser);
      for (let j = 0; j < levelsNew.length; j++) {
        for (let i = 0; i < this.levels.length; i++) {
          if (
            this.levels[i].idUser == idUser &&
            this.levels[i].cat == levelsNew[j].cat
          ) {
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
    if (body.MyCommitment.length > 0) {
      let comms = body.MyCommitment.filter((c) => c.idUser == idUser);
      for (let i = 0; i < comms.length; i++) {
        if (comms[i].idCommitment < 0) {
          if (
            checkNotNull(comms[i].date) &&
            checkNotNull(comms[i].date) &&
            checkNotNull(comms[i].name) &&
            checkNotNull(comms[i].desc) &&
            checkNotNull(comms[i].idUser)
          ) {
            newIdMap.MyCommitment[comms[i].idCommitment] = ++this
              .lastCommitmentId;
            comms[i].idCommitment =
              newIdMap.MyCommitment[comms[i].idCommitment];
            this.commitment.push({
              idCommitment: comms[i].idCommitment,
              date: comms[i].date,
              desc: comms[i].desc,
              idUser: idUser,
            });
          }
        } else {
          let j = 0;
          for (; j < this.commitment.length; j++) {
            if (this.commitment[j].idCommitment == comms[i].idCommitment) {
              this.commitment[j].date = comms[i].date;
              this.commitment[j].name = comms[i].name;
              this.commitment[j].desc = comms[i].desc;
              break;
            }
          }
        }
      }
      this.commitment = this.commitment.filter(
        (c) =>
          c.idUser != idUser ||
          comms.filter((cs) => cs.idCommitment == c.idCommitment).length > 0
      );
      this.store.saveData("MyCommitment", this.commitment);
    }
  }

  updateMyInscription(idUser, body, newIdMap) {
    if (body.MyCommitment.length > 0) {
      let insc = body.Inscriptions.filter((i) => i.idUser == idUser);
      for (let i = 0; i < insc.length; i++) {
        if (insc[i].idSchool < 0) {
          insc[i].idSchool = newIdMap.School[insc[i].idSchool];
          this.inscriptions.push({
            idUser: idUser,
            idSchool: insc[i].idSchool,
          });
        } else {
          let j = 0;
          for (; j < this.inscriptions.length; j++) {
            if (
              this.inscriptions[j].idUser == idUser &&
              this.inscriptions[j].idSchool == insc[i].idSchool
            ) {
              break;
            }
          }
          if (j == this.inscriptions.length) {
            this.inscriptions.push({
              idUser: idUser,
              idSchool: insc[i].idSchool,
            });
          }
        }
        this.inscriptions = this.inscriptions.filter(
          (i) =>
            i.idUser != idUser ||
            insc.filter((is) => is.idSchool == c.idSchool).length > 0
        );
        this.store.saveData("Inscription", this.inscriptions);
      }
    }
  }

  updateMyStep(idUser, body, newIdMap) {
    if (body.MyStep.length > 0) {
      let steps = body.MyStep;
      for (let i = 0; i < steps.length; i++) {
          if(this.checkNotNull(steps[i].idMyStep) &&
          this.checkNotNull(steps[i].name) &&
          this.checkNotNull(steps[i].unitMeasure) &&
          this.checkNotNull(steps[i].max) &&
          this.checkNotNull(steps[i].repetitionDay) &&
          this.checkNotNull(steps[i].type)){
            if (steps[i].idCommitment < 0) {
                steps[i].idCommitment = newIdMap.MyCommitment[steps[i].idCommitment];
                if (steps[i].idCommitment == undefined) {
                    continue;
                }
                // new commitment also means new step
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
                        this.steps[j].max = steps[i].max;repetitionDay
                        this.steps[j].repetitionDay = steps[i].name;
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
