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
const { Console } = require("console");
const Search = require("./search");

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
var search = new Search(store);

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
var getservices = [fileManager, search];

const app = async () => {
    http.createServer(function (req, res) {
        console.log("received message");
        var body = [];
        let query = url.parse(req.url, true).query;
        if (req.url != "/") {
            query = url.parse(req.url, true).query;
        }
        req.on("data", function (chunk) {
            let i = 0;
            for (; i < chunkservices.length; i++) {
                if (chunkservices[i].service == query.to) {
                    chunkservices[i].manageChunk(query, chunk);
                    break;
                }
            }
            if (i == chunkservices.length) {
                body.push(chunk);
            }
        });
        req.on("end", async function () {
            console.log("end");
            if (body.length != 0) {
                body = JSON.parse(Buffer.concat(body).toString());
            } else {
                body = query;
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
                            console.log("post response", d);
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
                res.end();
            }
            if (req.method == "GET") {
                if (query.to == undefined || query.to == "") {
                    code = 400;
                    response = '{"message": "function not found"}';
                } else {
                    let i = 0;
                    for (; i < getservices.length; i++) {
                        if (getservices[i].service == query.to) {
                            let d = await getservices[i].manageGet(query, res);
                            code = d.code;
                            response = d.response;
                            if (response == undefined) {
                                return;
                            }
                            break;
                        }
                    }
                    if (i == getservices.length) {
                        code = 400;
                        response = '{"message": "function not foundo"}';
                    }
                }
                if (response != "{}") {
                    res.writeHead(code, {
                        "Content-Type": "application/json",
                    });
                    res.write(JSON.stringify(response), "UTF-8");
                }
            }
            console.log("end");
        });
    }).listen(port);
    console.log("listening on " + port);
};

app();
