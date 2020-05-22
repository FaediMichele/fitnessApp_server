const http = require("http");
const url = require("url");

const Storage = require("./database");
const Login = require("./login");

const port = 8080;

var store = new Storage();
var login = new Login(store);


var services = [login]

const app = async () => {
    http.createServer(function (req, res) {
        var body = [];
        req.on("data", function (chunk) {
            body.push(chunk);
        });
        req.on("end", async function () {
            if (body.length != 0) {
                body = JSON.parse(Buffer.concat(body).toString());
            }
            let code = 500;
            let response = "{}";
            if (body.to != undefined && body.to != "") {
                for (let i = 0; i < services.length; i++) {
                    if (services[i].service = body.to) {
                        let d = await services[i].managePost(body);
                        code = d.code;
                        response = d.response;
                    }
                }
            }

            res.writeHead(code);
            res.write(JSON.stringify(response));
            res.end();

        });
    }).listen(port);
    console.log("listening on " + port);
}

app();