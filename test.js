const fetch = require("node-fetch");
const readline = require("readline");
const fs = require("fs");
const json = require("big-json");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

var test = async () => {
    var body = JSON.stringify({ to: "login", data: { email: "ciaobello", hashPassword: "p" } });
    var loginData;
    await fetch("http://localhost:8080", { method: "POST", body: body })
        .then((data) => data.json())
        .then((json) => (loginData = json));

    //body = fs.readFileSync("file.mp4");
    fetch("http://localhost:8080?to=fileManager&idSession=" + loginData.Sessionid + "&method=getVideo&idExercise=90", {
        method: "GET",
    }).then((data) => data.body.pipe(fs.createWriteStream("tmp.mp4")));
    console.log("end");
};
test();
