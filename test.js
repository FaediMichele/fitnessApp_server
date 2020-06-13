const fetch = require("node-fetch");
const readline = require("readline");
const fs = require("fs");
const json = require('big-json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var test = async () => {
    var body = JSON.stringify({ to: "login", data: { email: "ciaobello", hashPassword: "p" } });
    var loginData;
    await fetch("http://localhost:8080", { method: "POST", body: body })
        .then(data => data.json())
        .then(json => loginData = json);

    
    body = fs.readFileSync("file.mp4");
    fetch("http://localhost:8080?to=fileManager&method=addVideo&&idSession="+loginData.SessionId+"&idExercise=90", { method: "POST", body: body })
        .then(data => data.json())
        .then(json => console.log("2\n", json));
}
test();