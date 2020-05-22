const http = require("http");
const url = require("url");

const port = 8080;



const app = async () => {
    http.createServer(function (req, res) {
        var body = [];
        req.on("data", function (chunk) {
            body.push(chunk);
        });
        req.on("end", async function () {
            if (body.length != 0) {
                body = JSON.parse(Buffer.concat(body).toString());
                let code = 500;
                /* TODO */

                res.writeHead(code);
                res.end();
            }
        });
    }).listen(port);
    console.log("listening on " + port);
}

app();