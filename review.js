var functions = require("./util.js");

const service = "review";

class review {
    constructor(store) {
        this.store = store;
        this.service = service;
        this.review = store.getTable("Review");
        this.course = store.getTable("Course");
    }

    async manageGet(queryString) {}

    async managePost(body) {
        let idUser = this.store.getIdUser(body.idSession);
        if (
            body.method == "addReview" &&
            idUser != undefined &&
            body.data.idCourse != undefined &&
            body.data.text != undefined &&
            body.data.val != undefined
        ) {
            if (this.review.filter((r) => r.idUser == idUser && r.idCourse == body.data.idCourse).length > 0) {
                return { code: 400, response: '{message: "review already exist"}' };
            }
            let newReview = {
                idCourse: body.data.idCourse,
                idUser: idUser,
                val: body.data.val,
                comment: body.data.text,
                date: new Date(),
            };
            this.review.push(newReview);

            Array.prototype.average = function () {
                return this.length == 0 ? 0 : this.reduce((a, b) => a + b) / this.length;
            };

            this.course.forEach((c) => {
                c.review = this.review
                    .filter((r) => r.idCourse == c.idCourse)
                    .map((r) => r.val)
                    .average();
            });

            this.store.saveData("Review", this.review);
            this.store.saveData("Course", this.course);
            return { code: 200, response: { Review: [newReview] } };
        }
        return { code: 400, response: '{message: "method not found"}' };
    }
}

module.exports = review;
