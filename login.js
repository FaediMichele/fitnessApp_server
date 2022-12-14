var functions = require("./util.js");

const service = "login";

class login {
    constructor(store) {
        this.store = store;
        this.service = service;
    }

    async manageGet(queryString) {}

    async managePost(body) {
        if (
            body.data.email != undefined &&
            body.data.email != "" &&
            body.data.hashPassword != undefined &&
            body.data.hashPassword != ""
        ) {
            var user = this.store.getTable("User").filter((u) => {
                return u.email == body.data.email && u.hashPassword == body.data.hashPassword;
            })[0];
            if (user == undefined) {
                return {
                    code: 401,
                    response: '{message: "Login failed. Did not find any user with those credential"}',
                };
            }

            var response = {};
            response.Friendship = this.store
                .getTable("Friendship")
                .filter((f) => f.idUser1 == user.idUser || f.idUser2 == user.idUser2);

            response.User = this.store
                .getTable("User")
                .filter(
                    (u) =>
                        u.idUser == user.idUser ||
                        functions.searchObjectInArray(response.Friendship, u.idUser, "idUser2") != undefined
                );
            response.User = JSON.parse(JSON.stringify(response.User));
            response.User.forEach(function (v) {
                v.hashPassword = "not avaliable";
            });

            // idUser1 must be the id of the user making the request
            for (let i = 0; i < response.Friendship.lenght; i++) {
                if (response.Friendship[i].idUser1 != user.idUser) {
                    let tmp = response.Friendship[i].idUser1;
                    response.Friendship[i].idUser2 = user.idUser;
                    response.Friendship[i].idUser1 = tmp;
                }
            }

            let courseBought = this.store.getTable("CourseBought").filter((c) => c.idUser == user.idUser);
            response.Course = functions.getObjectsArray2inArray1(
                courseBought,
                "idCourse",
                JSON.parse(JSON.stringify(this.store.getTable("Course"))),
                "idCourse"
            );

            response.School = functions.getObjectsArray2inArray1(
                response.Course,
                "idSchool",
                this.store.getTable("School"),
                "idSchool"
            );
            response.School = this.makeUnique(response.School, "idSchool");
            response.Course = response.Course.concat(
                this.store.getTable("Course").filter((c) => response.School.map((s) => s.idSchool).includes(c.idSchool))
            );
            response.Course = this.makeUnique(response.Course, "idCourse");

            // ADD all bought course, for every couse add all school, for every school add course -> add review

            response.User = response.User.concat(
                functions.getObjectsArray2inArray1(response.School, "idTrainer", this.store.getTable("User"), "idUser")
            );

            Array.prototype.average = function () {
                return this.length == 0 ? 0 : this.reduce((a, b) => a + b) / this.length;
            };

            response.Level = this.store
                .getTable("Level")
                .filter((l) => functions.searchObjectInArray(response.User, l.idUser, "idUser"));

            response.Review = functions.getObjectsArray2inArray1(
                response.Course,
                "idCourse",
                this.store.getTable("Review"),
                "idCourse"
            );

            response.User = response.User.concat(
                functions.getObjectsArray2inArray1(response.Review, "idUser", this.store.getTable("User"), "idUser")
            );

            response.User = this.makeUnique(response.User, "idUser");

            response.Course.forEach((c) => {
                c.isBought = true;
                c.review = response.Review.filter((r) => r.idCourse == c.idCourse)
                    .map((r) => r.val)
                    .average();
                c.isArchived = courseBought.filter(
                    (cb) => cb.idCourse == c.idCourse && cb.idUser == user.idUser
                )[0].isArchived;
            });

            let idAnalyzed = {};
            // only 10 review for course
            response.Review.filter((r) => {
                if (idAnalyzed[r.idCourse] == undefined) {
                    idAnalyzed[r.idCourse] = 1;
                    return true;
                } else if (idAnalyzed[r.idCourse] < 10) {
                    idAnalyzed[r.idCourse] = idAnalyzed[r.idCourse] + 1;
                    return true;
                }
                return false;
            });

            response.Exercise = this.store
                .getTable("Exercise")
                .filter((e) => functions.searchObjectInArray(courseBought, e.idCourse, "idCourse") != undefined);

            response.MyCommitment = this.store.getTable("MyCommitment").filter((c) => c.idUser == user.idUser);
            response.MyStep = functions.getObjectsArray2inArray1(
                response.MyCommitment,
                "idCommitment",
                this.store.getTable("MyStep"),
                "idCommitment"
            );
            response.MyStepDone = functions.getObjectsArray2inArray1(
                response.MyStep,
                "idMyStep",
                this.store.getTable("MyStepDone"),
                "idMyStep"
            );
            response.FriendshipRequest = this.store
                .getTable("FriendshipRequest")
                .filter((f) => f.idReceiver == user.idUser);

            response.SessionId = await this.store.login(user.idUser);
            response.idUser = user.idUser;

            console.log("Login done(" + body.data.email + ")");
            console.log(response);
            return { code: 200, response: response };
        }

        return { code: 404, response: '{message: "Login failed. Param was wrong"}' };
    }

    makeUnique(array, key) {
        let idAnalyzed = [];
        return array.filter((a) => {
            if (idAnalyzed.includes(a[key])) {
                return false;
            }
            idAnalyzed.push(a[key]);
            return true;
        });
    }
}

module.exports = login;
