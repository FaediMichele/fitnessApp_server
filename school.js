var functions = require("./util.js");

const service = "school"

class school {
    constructor(store) {
        this.store = store;
        this.service = service;
        this.schools = this.store.getTable("School");
        this.courses = this.store.getTable("Course");
        this.lastIdSchool = functions.getBestInArray(this.schools, "idSchool", (id1, id2) => id1 - id2).idSchool;
        this.lastIdCourse = functions.getBestInArray(this.courses, "idCourse", (id1, id2) => id1 - id2).idCourse;
    }

    async manageGet(queryString) { }

    async managePost(body) {
        let idUser = this.store.getIdUser(body.idSession);
        if (body.method == "insertSchool" && idUser != undefined) {
            let ok = true;
            let ids = [];
            let result = [];
            let addSchool = (s) => {
                this.lastIdSchool++;
                let school = { idSchool: this.lastIdSchool, name: s.name, email: s.email, address: s.address, idTrainer: idUser };
                if (school.name != undefined && school.email != undefined && school.address != undefined && school.idTrainer != undefined) {
                    result.push(school);
                    ids.push(this.lastIdSchool);
                } else {
                    ok = false;
                }
            }
            if (Array.isArray(body.data)) {
                body.data.forEach(addSchool);
            } else {
                addSchool(body.data);
            }
            if (!ok) {
                return { code: 400, response: '{message: "bad request. school param was wrong"}' };
            }
            this.schools = this.schools.concat(result);
            this.store.saveData("School", this.schools);
            return { code: 200, response: ids };
        } else if (body.method == "insertCourse") {
            let ok = true;
            let ids = [];
            let result = [];
            let addCourse = (s) => {
                this.lastIdCourse++;
                let course = { idCourse: this.lastIdCourse, idSchool: s.idSchool, cat: s.cat, name: s.name, desc: s.desc, minimumLevel: s.minimumLevel };
                if (course.idCourse != undefined && course.idSchool != undefined && course.cat != undefined && course.name != undefined
                    && course.desc != undefined && course.minimumLevel != undefined && this.store.searchKey("School", "idSchool", course.idSchool) != undefined) {
                    result.push(course);
                    ids.push(this.lastIdCourse);
                } else {
                    ok = false;
                }
            }
            if (Array.isArray(body.data)) {
                body.data.forEach(addCourse);
            } else {
                addCourse(body.data);
            }
            if (!ok) {
                return { code: 400, response: '{message: "bad request. course param was wrong"}' };
            }
            this.courses = this.courses.concat(result);
            this.store.saveData("Course", this.courses);
            return { code: 200, response: ids };
        } else if (body.method == "updateSchool") {
            let updateSchool = (s) => {
                let i = functions.getNumItemInArray(this.schools, "idSchool", s.idSchool);
                if (this.schools[i].idTrainer != idUser) {
                    return;
                }
                if (s.name != undefined) {
                    this.schools[i].name = s.name;
                }
                if (s.email != undefined) {
                    this.schools[i].email = s.email;
                }
                if (s.address != undefined) {
                    this.schools[i].address = s.address;
                }
            };
            if (Array.isArray(body.data)) {
                body.data.forEach(updateSchool);
            } else {
                updateSchool(body.data);
            }
            this.store.saveData("School", this.schools);
            return { code: 200, response: '{message: "ok"}' };
        } else if (body.method == "updateCourse") {
            let updateCourse = (s) => {
                let i = functions.getNumItemInArray(this.courses, "idCourse", s.idCourse);
                if (s.cat != undefined) {
                    this.courses[i].cat = s.cat;
                }
                if (s.name != undefined) {
                    this.courses[i].name = s.name;
                }
                if (s.desc != undefined) {
                    this.courses[i].desc = s.desc;
                }
                if (s.minimumLevel != undefined) {
                    this.courses[i].minimumLevel = parseInt(s.minimumLevel);
                }
            };
            if (Array.isArray(body.data)) {
                body.data.forEach(updateCourse);
            } else {
                updateCourse(body.data);
            }
            this.store.saveData("Course", this.courses);
            return { code: 200, response: '{message: "ok"}' };
        }
        return { code: 400, response: '{message: "bad request. function not found"}' };
    }
}

module.exports = school;