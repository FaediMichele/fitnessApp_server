const fs = require("fs");
const hash = require("object-hash");

const fileName = "data.json";
const msPerDay = 1000 * 60 * 60 * 24;
const dayForSession = 2;

class database {
    constructor() {
        this.loadData();
    }

    getTable(name) {
        if (name == undefined) {
            return undefined;
        }
        return this.data[name];
    }

    async saveData(name, data) {
        this.data[name] = data;
        var dataString = JSON.stringify(this.data);
        fs.writeFile(fileName, dataString, "utf8", function (err) {
            if (err) {
                console.log("error on save ", err);
            }
        });
    }

    loadData() {
        try {
            let data = fs.readFileSync(fileName);
            this.data = JSON.parse(data);
        } catch (error) {
            console.log("error on load ", error);
        }
    }

    getIdUser(idSession) {
        if (idSession == undefined) {
            return undefined;
        }
        let ret = this.data.Session.filter((s) => s.idSession == idSession)[0];
        if (ret == undefined) {
            return undefined;
        } else if (Math.floor(new Date() - new Date(ret.lastLogin)) / msPerDay > dayForSession) {
            this.data.Session = this.data.Session.filter((s) => s.idSession != idSession);
            this.saveData("Session", this.data.Session);
            return undefined;
        } else {
            return ret.idUser;
        }
    }

    async login(idUser) {
        let ret = this.data.Session.filter((s) => s.idUser == idUser)[0];
        if (ret != undefined) {
            if (Math.floor(new Date() - new Date(ret.lastLogin)) / msPerDay > dayForSession) {
                this.data.Session = this.data.Session.filter((s) => s.idUser != idUser);
            } else {
                return ret.idSession;
            }
        }
        let d = new Date();
        let obj = { idUser: idUser, lastLogin: d };
        let idSession = hash(obj);
        obj.idSession = idSession;
        this.data.Session.push(obj);
        await this.saveData("Session", this.data.Session);
        return idSession;
    }

    logout(idSession) {
        this.data.Session = this.data.Session.filter((s) => s.idSession != idSession);
        this.saveData("Session", this.data.Session);
    }

    searchKey(tableName, fieldKeyName, keyToSearch) {
        let table = this.getTable(tableName);
        let ret = [];
        if (table != undefined) {
            for (let i = 0; i < table.length; i++) {
                if (table[i][fieldKeyName] == keyToSearch) {
                    ret.push(i);
                }
            }
        }
        if (ret.length > 1) {
            return ret;
        } else if (ret.length == 1) {
            return ret[0];
        }
        return undefined;
    }
}

module.exports = database;
