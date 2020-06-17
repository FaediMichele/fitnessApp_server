var functions = require("./util.js");
const fs = require("fs");

const service = "fileManager";

class fileManager {
    constructor(store) {
        this.store = store;
        this.service = service;
        this.exercise = store.getTable("Exercise");
        this.course = store.getTable("Course");
        this.streamsEx = [];
        this.streamsCo = [];
    }

    async manageGet(queryString, res) {
        if (queryString.method == "getVideo" && queryString.idExercise != undefined && queryString.idExercise != "") {
            let path = "./files/Exercise-" + queryString.idExercise + ".mp4";
            if (fs.existsSync(path)) {
                fs.createReadStream(path).pipe(res);
                console.log("here2");
                res.writeHead(code, {
                    "Content-Type": "video/mp4",
                });
                return { code: 200, response: undefined };
            } else {
                res.writeHead(code, {
                    "Content-Type": "application/json",
                });
                res.write('{"message": "file does not exist"}');
            }
        }
        if (queryString.method == "getVideo" && queryString.idCourse != undefined && queryString.idCourse != "") {
            let path = "./files/Course-" + queryString.idCourse + ".mp4";
            if (fs.existsSync(path)) {
                fs.createReadStream(path).pipe(res);
                console.log("here2");
                res.writeHead(code, {
                    "Content-Type": "video/mp4",
                });
                return { code: 200, response: undefined };
            } else {
                res.writeHead(code, {
                    "Content-Type": "application/json",
                });
                res.write('{"message": "file does not exist"}');
            }
        }
    }

    async managePost(queryString) {
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
        return { code: 400, response: '{message: "method not found"}' };
    }

    async manageChunk(queryString, chunk) {
        let idUser = this.store.getIdUser(queryString.idSession);
        if (idUser != undefined && queryString.method == "addVideo") {
            if (queryString.idExercise != undefined) {
                let i = this.store.searchKey("Exercise", "idExercise", queryString.idExercise);
                if (i != undefined) {
                    if (this.streamsEx[queryString.idExercise] == undefined) {
                        let filename = "Exercise-" + queryString.idExercise + ".mp4";
                        this.exercise[i].video = filename;
                        this.store.saveData("Exercise", this.exercise);
                        this.streamsEx[queryString.idExercise] = fs.createWriteStream("./files/" + filename);
                    }
                    this.streamsEx[queryString.idExercise].write(chunk);
                }
            }
            if (queryString.idCourse != undefined) {
                let i = this.store.searchKey("Course", "idCourse", queryString.idCourse);
                if (i != undefined) {
                    if (this.streamsCo[queryString.idCourse] == undefined) {
                        let filename = "Course-" + queryString.idCourse + ".mp4";
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
