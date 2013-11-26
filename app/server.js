var express = require('express');
var fs = require('fs');
//var checkstatus = require('./checkstatus');
var app = express();
var childProcess = require('child_process')
var phantomjs = require('phantomjs')
var binPath = phantomjs.path
var path = require('path')
var gistStatusCache = {}
var CACHE_TIMEOUT_DAYS = 7 //7 days

app.get('/', function (req, res) {
//    var fullURL = req.protocol + "://" + req.get('host') + req.url;
//    var parsed = url.parse(fullURL, true);
        var url = req.query.url;
        console.log(url);
        var body = 'Checking graphgist at ' + url;
        var OK = 0;
        var FAIL = 1;
        if (gistStatusCache[url] && gistStatusCache[url].date.getDate() + CACHE_TIMEOUT_DAYS < new Date()) {
            console.log("found cached status");
            var status = gistStatusCache[url].status;
            send_response(status);

        } else {
            var childArgs = [
                path.join(__dirname, './checkstatus.js'), url        ]

            childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
                    console.log(arguments);
                    var status = FAIL;
                    if (stdout.indexOf("status: Errors") !== -1) {
                        gistStatusCache[url] = {
                            data: new Date(),
                            status: FAIL
                        }
                    } else {
                        gistStatusCache[url] = {
                            data: new Date(),
                            status: OK
                        }
                        status = OK;
                    }
                    send_response(status);
                }
            )

        }

        send_response = function (status) {
            console.log("sending response:" +status);
            var img = fs.readFileSync('./app/img/fail.png');
            if (status == OK) {
                img = fs.readFileSync('./app/img/ok.png');
            }
            res.writeHead(200, {'Content-Type': 'image/png' });
            res.end(img, 'binary');
        }

    }
)
;


app.listen(3000);
console.log('Listening on port 3000');