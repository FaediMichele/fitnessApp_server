var functions = require("./util.js");
const fs = require("fs");
const { isArray } = require("util");
const { Console } = require("console");

const service = "fileManager";

class fileManager {
    constructor(store) {
        this.store = store;
        this.service = service;
        this.exercise = store.getTable("Exercise");
        this.course = store.getTable("Course");
        this.step = store.getTable("Step");
        this.streamsEx = [];
        this.streamsCo = [];
        this.streamsSt = [];
    }

    async manageGet(queryString, res) {
        console.log(queryString);
        if (queryString.method == "getFile" && queryString.filename != undefined && queryString.filename != "") {
            let path = "./files/" + queryString.filename;
            console.log("here");
            if (fs.existsSync(path)) {
                res.writeHead(200, { "Content-Type": "video/mp4" });
                fs.createReadStream(path).pipe(res);
                return { code: 200, response: undefined };
            } else {
                res.writeHead(401, {
                    "Content-Type": "application/json",
                });
                res.write('{"message": "file does not exist"}');
            }
        }
        return { code: 404, response: '{"message": "method not found"}' };
    }

    async managePost(body, queryString) {
        if (this.streamsEx[queryString.idExercise] != undefined) {
            this.streamsEx[queryString.idExercise].end();
            this.streamsEx[queryString.idExercise] = undefined;
            return { code: 200, response: '{message: "ok"}' };
        }
        if (this.streamsCo[queryString.idCourse] != undefined) {
            this.streamsCo[queryString.idCourse].end();
            this.streamsCo[queryString.idCourse] = undefined;
            return { code: 200, response: '{message: "ok"}' };
        }
        if (this.streamsCo[queryString.idStep] != undefined) {
            this.streamsCo[queryString.idStep].end();
            this.streamsCo[queryString.idStep] = undefined;
            return { code: 200, response: '{message: "ok"}' };
        }
        return { code: 400, response: '{message: "method not found"}' };
    }

    async manageChunk(queryString, chunk) {
        let idUser = this.store.getIdUser(queryString.idSession);
        if (idUser != undefined) {
            let format = "." + queryString.format;
            if (queryString.idExercise != undefined && queryString.num != undefined) {
                let i = this.store.searchKey("Step", "idExercise", queryString.idExercise);

                if (i != undefined) {
                    if (isArray(i)) {
                        for (let j = 0; j < i.length; j++) {
                            if (this.step[i[j]].num == queryString.num) {
                                i = i[j];
                                break;
                            }
                        }
                    }

                    if (this.streamsSt[queryString.idExercise + "-" + queryString.num] == undefined) {
                        let filename = "Step-" + queryString.idExercise + "|" + queryString.num + format;
                        this.step[i].video = filename;
                        this.store.saveData("Step", this.step);
                        this.streamsSt[queryString.idExercise + "-" + queryString.num] = fs.createWriteStream(
                            "./files/" + filename
                        );
                    }
                    this.streamsSt[queryString.idExercise + "-" + queryString.num].write(chunk);
                }
            } else if (queryString.idExercise != undefined) {
                let i = this.store.searchKey("Exercise", "idExercise", queryString.idExercise);
                if (i != undefined) {
                    if (this.streamsEx[queryString.idExercise] == undefined) {
                        let filename = "Exercise-" + queryString.idExercise + format;
                        this.exercise[i].video = filename;
                        this.store.saveData("Exercise", this.exercise);
                        this.streamsEx[queryString.idExercise] = fs.createWriteStream("./files/" + filename);
                    }
                    this.streamsEx[queryString.idExercise].write(chunk);
                }
            } else if (queryString.idCourse != undefined) {
                let i = this.store.searchKey("Course", "idCourse", queryString.idCourse);
                if (i != undefined) {
                    if (this.streamsCo[queryString.idCourse] == undefined) {
                        let filename = "Course-" + queryString.idCourse + format;
                        this.course[i].video = filename;
                        this.store.saveData("Course", this.course);
                        this.streamsCo[queryString.idCourse] = fs.createWriteStream("./files/" + filename);
                    }
                    this.streamsCo[queryString.idCourse].write(chunk);
                }
            }
        }
    }
}

module.exports = fileManager;
