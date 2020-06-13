var functions = require("./util.js");

const service = "login";

class login {
    constructor(store) {
        this.store = store;
        this.service = service;
    }

    async manageGet(queryString) { }

    async managePost(body) {
        if (body.data.email != undefined && body.data.email != "" && body.data.hashPassword != undefined && body.data.hashPassword != "") {
            var user = this.store.getTable("User").filter(u => u.email == body.data.email && u.hashPassword == body.data.hashPassword)[0];
            if (user == undefined) {
                return { code: 401, response: '{message: "Login failed. Did not find any user with those credential"}' };
            }

            var response = {};
            response.Friendship = this.store.getTable("Friendship").filter(f => f.idUser1 == user.idUser || f.idUser2 == user.idUser2);

            response.User = this.store.getTable("User").filter(u => u.idUser == user.idUser || functions.searchObjectInArray(response.Friendship, u.idUser, "idUser2") != undefined);

            // idUser1 must be the id of the user making the request
            for (let i = 0; i < response.Friendship.lenght; i++) {
                if (response.Friendship[i].idUser1 != user.idUser) {
                    let tmp = response.Friendship[i].idUser1;
                    response.Friendship[i].idUser2 = user.idUser;
                    response.Friendship[i].idUser1 = tmp;
                }
            }

            response.Message = this.store.getTable("Message").filter(m => functions.searchObjectInArray(response.Friendship, m.idFriendship, "idFriendship") != undefined);
            response.Level = this.store.getTable("Level").filter(l => functions.searchObjectInArray(response.User, l.idUser, "idUser"));
            response.History = this.store.getTable("History").filter(h => h.idUser == user.idUser);

            let schoolInscripted = this.store.getTable("Inscription").filter(s => s.idUser == user.idUser);

            response.School = functions.getObjectsArray2inArray1(schoolInscripted, "idSchool", this.store.getTable("School"), "idSchool");
            response.User.concat(functions.getObjectsArray2inArray1(response.School, "idTrainer", this.store.getTable("User"), "idUSer"));
            response.Review = this.store.getTable("Review").filter(r => r.idUser == user.idUser);
            response.CourseBought = this.store.getTable("CourseBought").filter(c => c.idUser == user.idUser);
            response.Course = functions.getObjectsArray2inArray1(response.CourseBought, "idCourse", this.store.getTable("Course"), "idCourse").concat(
                functions.getObjectsArray2inArray1(response.School, "idSchool", this.store.getTable("Course"), "idSchool")
            );
            response.Exercise = this.store.getTable("Exercise").filter(e => functions.searchObjectInArray(response.CourseBought, e.idCourse, "idCourse") != undefined);
            response.Step = this.store.getTable("Step").filter(s => functions.searchObjectInArray(response.Exercise, s.idExercise, "idExercise"));
            response.ExerciseInProgress = this.store.getTable("ExerciseInProgress").filter(ex => ex.idUser == user.idUser);
            response.MyCommitment = this.store.getTable("MyCommitment").filter(c => c.idUser == user.idUser);
            response.MyStep = functions.getObjectsArray2inArray1(response.MyCommitment, "idCommitment", this.store.getTable("MyStep"), "idCommitment");
            response.MyStepDone = functions.getObjectsArray2inArray1(response.MyStep, "idMyStep", this.store.getTable("MyStepDone"), "idMyStep");
            response.SessionId = await this.store.login(user.idUser);
            return { code: 200, response: response };
        }
        return { code: 404, response: '{message: "Login failed. Param was wrong"}' }
    }
}

module.exports = login