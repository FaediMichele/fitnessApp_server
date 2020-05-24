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
        to: "commitment", method: "addCommitment",
        idSession: loginData.SessionId,
        data:
            {
                commitment:{
                    name: "dimagrire",
                    desc: "dimagrire per l'estate"
                },
                steps:[{
                    name: "mangiare mele",
                    unitMeasure: "mele",
                    max: 5,
                    repetitionDay: 1,
                    type: "progresion"
                },
                {
                    name: "correre 5 km",
                    unitMeasure: "km",
                    max: 5000,
                    repetitionDay: 7,
                    type: "progresion"
                }]
            }
    });
    fetch("http://localhost:8080", { method: "POST", body: body })
        .then(data => data.json())
        .then(json => console.log("2\n", json));
}
test();