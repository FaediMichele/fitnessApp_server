var functions = require("./util.js");

const service = "courseBought";

class CourseBought {
    constructor(store) {
        this.store = store;
        this.service = service;
        this.courseBought = this.store.getTable("CourseBought");
        this.courses = this.store.getTable("Course");
        this.exercise = this.store.getTable("Exercise");
        this.review = this.store.getTable("Review");
    }

    async manageGet(queryString) {}

    async managePost(body) {
        let idUser = this.store.getIdUser(body.idSession);
        if (idUser != undefined) {
            if (body.method == "buyCourse" && body.data.idCourse != undefined && body.data.idCourse != "") {
                if (
                    this.courseBought.filter((c) => c.idUser == idUser && c.idCourse == body.data.idCourse).length > 0
                ) {
                    return { code: 201, response: '{"message": "Course already bought"}' };
                }
                this.courseBought.push({ idUser: idUser, idCourse: body.data.idCourse, isArchived: false });
                this.store.saveData("CourseBought", this.courseBought);

                let course = this.courses.filter((c) => c.idCourse == body.data.idCourse)[0];
                course = JSON.parse(JSON.stringify(course));
                course.isBought = true;
                course.isArchived = false;
                let exercise = this.exercise.filter((e) => e.idCourse == course.idCourse);
                let school = this.store.getTable("School").filter((s) => s.idSchool == course.idSchool)[0];
                let trainer = this.store.getTable("User").filter((u) => u.idUser == school.idTrainer)[0];
                let trainerLevel = this.store.getTable("Level").filter((ul) => ul.idUser == trainer.idUser);
                let review = this.store.getTable("Review").filter((r) => r.idCourse == course.idCourse);

                return {
                    code: 200,
                    response: {
                        Course: [course],
                        Exercise: exercise,
                        School: [school],
                        User: [trainer],
                        Level: trainerLevel,
                        Review: review,
                    },
                };
            } else if (body.method == "archiveCourse" && body.data.idCourse != undefined) {
                let myCourse = this.courseBought.filter((c) => c.idUser == idUser && c.idCourse == body.data.idCourse);
                if (myCourse.length == 0) {
                    return { code: 401, response: '{"message": "Course not bought"}' };
                }
                myCourse = myCourse[0];
                myCourse.isArchived = !myCourse.isArchived;
                this.store.saveData("CourseBought", this.courseBought);
                return { code: 200, response: { value: myCourse.isArchived } };
            }
        }
        return { code: 400, response: '{"message": "idSession is not correct"}' };
    }
}

module.exports = CourseBought;
