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


var services = [login, user, school, courseBought, exerciseInProgress, friend, history, review, commitment];
var servicesWithChunk = [fileManager];

const app = async () => {
    http.createServer(function (req, res) {
        var body = [];
        let queryParam = undefined;
        if(req.url!= "/"){
            queryParam = url.parse(req.url, true).query;
        }
        console.log(queryParam + "ciao");
        req.on("data", function (chunk) {
            if(queryParam!=undefined){
                for(let i = 0; i < servicesWithChunk.length; i++){
                    if(servicesWithChunk[i].service == queryParam.to){
                        servicesWithChunk[i].manageChunk(queryParam, chunk);
                        return;
                    }
                }
            }
            body.push(chunk);
        });
        req.on("end", async function () {
            if (body.length != 0) {
                body = JSON.parse(Buffer.concat(body).toString());
            }
            let code = 500;
            let response = "{}";
            if(queryParam != undefined){
                for (let i = 0; i < servicesWithChunk.length; i++) {
                    if (servicesWithChunk[i].service == queryParam.to) {
                        let d;
                        if(req.method == "POST"){
                            d = await servicesWithChunk[i].managePost(queryParam, res);
                        } else{
                            d = await servicesWithChunk[i].manageGet(queryParam, res);
                        }
                        code = d.code;
                        response = d.response;
                        break;
                    }
                }
            } else{
                if (body.to != undefined && body.to != "") {
                    for (let i = 0; i < services.length; i++) {
                        if (services[i].service == body.to) {
                            let d = await services[i].managePost(body);
                            code = d.code;
                            response = d.response;
                            break;
                        }
                    }
                }
            }
            res.writeHead(parseInt(200), {"Content-Type": "application/json", "chaset": "utf-8"});
            res.end(JSON.stringify(response));
        });
    }).listen(port);
    console.log("listening on " + port);
}

app();