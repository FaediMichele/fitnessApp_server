const fs = require("fs");

const fileName = "data.json"

class database {
    constructor() {
        this.loadData();
    }

    getTable(name) {
        return this.data[name];
    }

    async saveData(name, data) {
        this.getApp(name).data = data;
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
}

module.exports = database;