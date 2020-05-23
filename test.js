const fetch = require("node-fetch");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var test = async () => {
    var body = JSON.stringify({ to: "login", email: "ciaobello", hashPassword: "p" });
    var loginData;
    await fetch("http://localhost:8080", { method: "POST", body: body })
        .then(data => data.json())
        .then(json => loginData = json);

    console.log(loginData.SessionId);



    body = JSON.stringify({
        to: "school", method: "updateSchool",
        idSession: loginData.SessionId,
        data:
            [{
                idSchool: 422,
                cat: "asd",
                name: "asd bello",
                desc: "Corso asd bello",
                minimumLevel: 3
            }]
    });
    fetch("http://localhost:8080", { method: "POST", body: body })
        .then(data => data.json())
        .then(json => console.log("2\n", json));
}
test();