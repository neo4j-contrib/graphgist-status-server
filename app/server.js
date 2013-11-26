process.on('uncaughtException', function (err) {
    console.log("Uncaught Exception", err)
    console.log(err.stack)
});

var express = require('express');
var fs = require('fs');
//var checkstatus = require('./checkstatus');
var app = express();
var childProcess = require('child_process')
var phantomjs = require('phantomjs')
var binPath = phantomjs.path
var path = require('path')
var gistStatusCache = {}
var CACHE_TIMEOUT_DAYS = 1 //days

app.configure(function () {
	app.set('port', process.env.PORT || 3000);
});

app.get('/', function (req, res) {
    var url = req.query.url;
//    console.log(url);
    var body = 'Checking graphgist at ' + url;
    var OK = 0;
    var FAIL = 1;
    console.log("cache: " + JSON.stringify(gistStatusCache));
    if (gistStatusCache[url]) {
        if (gistStatusCache[url].date.getDate() + CACHE_TIMEOUT_DAYS < new Date()) {
            console.log("found cached status " + JSON.stringify(gistStatusCache[url]));
            var status = gistStatusCache[url].status;
            send_response(status, res);
            return;
        } else {
            console.log("invalidating cached status" + JSON.stringify(gistStatusCache[url]));
            gistStatusCache[url] = null;
        }

    }
    var childArgs = [path.join(__dirname, './checkstatus.js'), url]
    childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
//                console.log(arguments);
            var status = FAIL;
            if (stdout.indexOf("status: Errors") !== -1) {
                gistStatusCache[url] = {
                    date: new Date(),
                    status: FAIL
                }
            } else {
                gistStatusCache[url] = {
                    date: new Date(),
                    status: OK
                }
                status = OK;
            }
            send_response(status, res);
        }
    )


    send_response = function (status, res) {
        console.log("sending response:" + status);
        res.writeHead(200, {'Content-Type': 'image/png' });
        var img = fs.readFileSync('./app/img/fail.png');
        if (status == OK) {
            img = fs.readFileSync('./app/img/ok.png');
        }
        res.end(img, 'binary');
    }

});


app.listen(3000);
console.log('Listening on port 3000');