const fetch = require("node-fetch");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
body = JSON.stringify({ to: "login", email: "email", hashPassword: "p" });
fetch("http://localhost:8080", { method: "POST", body: body })
    .then(data => data.json())
    .then(json => console.log(json));