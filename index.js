const http = require("http");
const url = require("url");

const Storage = require("./database");
const Login = require("./login");
const User = require("./user");
const School = require("./school");
const CourseBought = require("./courseBought");
const ExerciseInProgress = require("./exerciseInProgress");
const Friend = require("./friend");
const History = require("./history");
const Review = require("./review");
const Commitment = require("./commitment");
const FileManager = require("./fileManager");
const Logout = require("./logout");

const port = 8080;

var store = new Storage();
var login = new Login(store);
var user = new User(store);
var school = new School(store);
var courseBought = new CourseBought(store);
var exerciseInProgress = new ExerciseInProgress(store);
var friend = new Friend(store);
var history = new History(store);
var review = new Review(store);
var commitment = new Commitment(store);
var fileManager = new FileManager(store);
var logout = new Logout(store);

var postservices = [
    login,
    user,
    school,
    courseBought,
    exerciseInProgress,
    friend,
    history,
    review,
    commitment,
    fileManager,
    logout,
];

var chunkservices = [fileManager];
var getservices = [fileManager];

const app = async () => {
    http.createServer(function (req, res) {
        var body = [];
        const query = url.parse(req.url, true).query;
        console.log(query);
        req.on("data", function (chunk) {
            let i = 0;
            for (; i < chunkservices.length; i++) {
                if (chunkservices[i].service == query.to) {
                    chunkservices[i].manageChunk(chunk, query);
                }
            }
            if (i == chunkservices.length) {
                body.push(chunk);
            }
        });
        req.on("end", async function () {
            if (body.length != 0) {
                body = JSON.parse(Buffer.concat(body).toString());
            }
            let code = 500;
            let response = "{}";

            if (req.method == "POST") {
                if (body.to != undefined && body.to != "") {
                    let i = 0;
                    for (; i < postservices.length; i++) {
                        if (postservices[i].service == body.to) {
                            let d = await postservices[i].managePost(body, query);
                            code = d.code;
                            response = d.response;
                            break;
                        }
                    }
                    if (i == postservices.length) {
                        code = 400;
                        response = '{"message": "function not found"}';
                    }
                }
                res.writeHead(code, {
                    "Content-Type": "application/json",
                });
                res.write(JSON.stringify(response), "UTF-8");
            }
            if (req.method == "GET") {
                if (query.to == undefined || query.to == "") {
                    code = 400;
                    response = '{"message": "function not found"}';
                } else {
                    let i = 0;
                    for (; i < getservices.length; i++) {
                        if (getservices[i].service == body.to) {
                            await getservices[i].manageGet(query, res);
                            break;
                        }
                    }
                    if (i == getservices.length) {
                        code = 400;
                        response = '{"message": "function not found"}';
                    }
                }
                if (response != "{}") {
                    res.writeHead(code, {
                        "Content-Type": "application/json",
                    });
                    res.write(JSON.stringify(response), "UTF-8");
                }
            }

            res.end();
        });
    }).listen(port);
    console.log("listening on " + port);
};

app();
