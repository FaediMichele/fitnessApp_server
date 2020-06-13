var functions = require("./util.js");
const fs = require("fs");

const service = "fileManager";

class fileManager {
    constructor(store) {
        this.store = store;
        this.service = service;
        this.exercise = store.getTable("Exercise");
        this.streams = [];
    }

    async manageGet(queryString) { }

    async managePost(queryString) {
        if(this.streams[queryString.idExercise] != undefined){
            this.streams[queryString.idExercise].end();
            this.streams[queryString.idExercise] = undefined;
            return {code: 200, response: '{message: "ok"}'};
        }
        return { code: 400, response: '{message: "method not found"}' };
    }

    async manageChunk(queryString, chunk){
        let idUser = this.store.getIdUser(queryString.idSession);
        if (queryString.method == "addVideo" && queryString.idExercise!= undefined) {
            let i=this.store.searchKey("Exercise", "idExercise", queryString.idExercise)
            if(i != undefined) {
                if(this.streams[queryString.idExercise] == undefined){
                    let filename=queryString.idExercise+".mp4"
                    this.exercise[i].video = filename;
                    this.store.saveData("Exercise", this.exercise);
                    this.streams[queryString.idExercise] = fs.createWriteStream("./files/"+filename);
                    this.streams[queryString.idExercise].write(chunk);
                } else{
                    this.streams[queryString.idExercise].write(chunk);
                }
            }
        }
    }
}

module.exports = fileManager