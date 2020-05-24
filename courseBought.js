var functions = require("./util.js");

const service = "courseBought";

class CourseBought {
    constructor(store) {
        this.store = store;
        this.service = service;
        this.Courses = this.store.getTable("CourseBought")
    }

    async manageGet(queryString) { }

    async managePost(body) {
        let idUser = this.store.getIdUser(body.idSession);
        if (body.method == "insertCourseBought") {
            let ok = true;
            let result = [];
            let addCourseBought = (c) => {
                if (c.idCourse != undefined &&
                    this.store.searchKey("Course", "idCourse", c.idCourse) != undefined) {
                    result.push({ idUser: idUser, idCourse: c.idCourse, level: 1, purchaseDate: new Date() });
                } else {
                    ok = false;
                }
            }
            if (Array.isArray(body.data)) {
                body.data.forEach(addCourseBought);
            } else {
                addCourseBought(body.data);
            }
            if (!ok) {
                return { code: 400, response: '{message: "bad request. param was wrong"}' };
            } else {
                this.Courses = this.Courses.concat(result);
                this.store.saveData("CourseBought", this.Courses);
                return { code: 200, response: '{message: "ok"}' };
            }
        } else if (body.method == "updateCourseBought") {
            let ok = true;;
            let updateCourseBought = (c) => {
                let i = functions.getNumItemInArray(this.Courses, ["idUser", "idCourse"], [idUser, c.idCourse]);
                if (c.idCourse != undefined &&
                    i != undefined &&
                    c.level != undefined) {
                    this.Courses[i].level = parseInt(c.level);
                } else {
                    ok = false;
                }
            }
            if (Array.isArray(body.data)) {
                body.data.forEach(updateCourseBought);
            } else {
                updateCourseBought(body.data);
            }
            if (!ok) {
                return { code: 400, response: '{message: "bad request. param was wrong"}' };
            } else {
                this.store.saveData("CourseBought", this.Courses);
                return { code: 200, response: '{message: "ok"}' };
            }
        }
    }
}

module.exports = CourseBought