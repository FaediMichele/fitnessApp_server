var functions = require("./util.js");

const service = "user";
const categories = ["sport", "mental", "social"];

class user {
    constructor(store, login) {
        this.store = store;
        this.service = service;
        this.users = this.store.getTable("User");
        this.levels = this.store.getTable("Level");
        this.Inscriptions = this.store.getTable("Inscription");
        this.lastId = functions.getBestInArray(this.users, "idUser", (id1, id2) => id1 - id2).idUser;
        this.login = login;
    }

    async manageGet(queryString) {}

    async managePost(body) {
        console.log(body);
        if (body.method == "addUser") {
            if (
                body.data.firstname != "" &&
                body.data.surname != "" &&
                body.data.email != "" &&
                body.data.hashPassword != ""
            ) {
                if (this.users.filter((u) => u.email == body.data.email).length != 0) {
                    return { code: 400, response: '{message: "bad request. email already in use"}' };
                }
                this.lastId++;
                let newUser = {
                    idUser: this.lastId,
                    firstname: body.data.firstname,
                    surname: body.data.surname,
                    email: body.data.email,
                    hashPassword: body.data.hashPassword,
                };

                let newLevels = [
                    { idUser: this.lastId, cat: "SPORT", PE: 1, level: 1 },
                    { idUser: this.lastId, cat: "SOCIAL", PE: 1, level: 1 },
                    { idUser: this.lastId, cat: "MENTAL", PE: 1, level: 1 },
                ];

                this.users.push(newUser);
                this.store.saveData("User", this.users);
                this.levels = this.levels.concat(newLevels);
                this.store.saveData("Level", this.levels);

                let d = await this.login.managePost({
                    data: {
                        email: newUser.email,
                        hashPassword: newUser.hashPassword,
                    },
                });
                console.log(d);

                return { code: 200, response: d.response };
            }
            return { code: 400, response: '{message: "bad request in user"}' };
        } else if (body.method == "addInscription" && body.idSession != undefined) {
            let idUserFromSession = this.store.getIdUser(body.idSession);
            if (idUserFromSession != undefined && body.data.idSchool != undefined) {
                if (this.store.searchKey("School", "idSchool", body.data.idSchool) == undefined) {
                    return { code: 400, response: '{message: "bad request. School key not found"}' };
                }
                if (
                    this.Inscriptions.filter((i) => i.idUser == idUserFromSession && i.idSchool == body.data.idSchool)
                ) {
                    return { code: 400, response: '{message: "bad request. Already inscripted in this school}' };
                }
                this.Inscriptions.push({ idUser: parseInt(idUserFromSession), idSchool: parseInt(body.data.idSchool) });
                this.store.saveData("Inscription", this.Inscriptions);
                return { code: 200, response: '{message: "ok"}' };
            }
            return { code: 400, response: '{message: "bad request at addInscription"}' };
        } else if (body.method == "updateUser" && body.idSession != undefined) {
            let idUserFromSession = this.store.getIdUser(body.idSession);
            if (idUserFromSession != body.data.idUser && idUserFromSession != undefined) {
                let user = body.data;
                let keyUser = this.getNumUserById(idUserFromSession);
                if (user.firstname != undefined) {
                    this.users[keyUser].firstname = user.firstname;
                }
                if (user.surname != undefined) {
                    this.users[keyUser].surname = user.surname;
                }
                if (user.email != undefined) {
                    this.users[keyUser].email = user.email;
                }
                if (user.hashPassword != undefined) {
                    this.users[keyUser].hashPassword = user.hashPassword;
                }
                this.store.saveData("User", this.users);
                return { code: 200, response: '{message: "ok"}' };
            }
            return { code: 400, response: '{message: "bad request at updateUser"}' };
        } else if (body.method == "updateUserLevel" && body.idSession != undefined) {
            let idUserFromSession = this.store.getIdUser(body.idSession);
            if (idUserFromSession != undefined && body.data.cat != undefined) {
                let level = body.data;
                let keyLevel = this.getNumLevelById(idUserFromSession, body.data.cat);
                if (keyLevel == undefined) {
                    return { code: 400, response: '{message: "bad request. level not found"}' };
                }
                if (level.PE != undefined) {
                    this.levels[keyLevel].PE = parseInt(level.PE);
                }
                if (level.level != undefined) {
                    this.levels[keyLevel].level = parseInt(level.level);
                }
                this.store.saveData("Level", this.levels);
                return { code: 200, response: '{message: "ok"}' };
            }
            return { code: 400, response: '{message: "bad request ad updateUserLevel"}' };
        } else if (body.method == "deleteInscription" && body.idSession != undefined) {
            let idUserFromSession = this.store.getIdUser(body.idSession);
            if (idUserFromSession != undefined && body.data.idSchool != undefined) {
                this.Inscriptions = this.Inscriptions.filter(
                    (i) => i.idUser != idUserFromSession && i.idSchool != body.data.idSchool
                );
                this.store.saveData("Inscription", this.Inscriptions);
                return { code: 200, response: '{message: "ok"}' };
            }
            return { code: 400, response: '{message: "bad request at delete"}' };
        }
        return { code: 400, response: '{message: "bad request. function not found"}' };
    }

    checkLevel(level, newIdUser) {
        if (categories.includes(level.cat) && level.PE > 0 && level.level > 0) {
            return { idUser: newIdUser, cat: level.cat, PE: parseInt(level.PE), level: parseInt(level.level) };
        }
        return false;
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

module.exports = user;
