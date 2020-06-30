const fetch = require("node-fetch");
const readline = require("readline");
const fs = require("fs");
const json = require("big-json");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

var test = async () => {
    var body = JSON.stringify({
        to: "login",
        data: { email: "ciaobello", hashPassword: "148de9c5a7a44d19e56cd9ae1a554bf67847afb0c58f6e12fa29ac7ddfca9940" },
    });
    var loginData;
    await fetch("http://localhost:8080", { method: "POST", body: body })
        .then((data) => data.json())
        .then((json) => (loginData = json));
    console.log(loginData.SessionId);

    body = fs.readFileSync("tmp.mp4");
    fetch("http://localhost:8080?to=fileManager&method=getFile&filename=Exercise-91.mp4", {
        method: "GET",
    })
        .then((data) => data.buffer())
        .then((data) => console.log(data));
    console.log("end");
};
test();
