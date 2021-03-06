process.on('uncaughtException', function (err) {
    console.log("Uncaught Exception", err)
    console.log(err.stack)
});

var express = require('express');
var fs = require('fs');
//var checkstatus = require('./checkstatus');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
});

var childProcess = require('child_process')
var phantomjs = require('phantomjs')
var binPath = phantomjs.path
var path = require('path')
var CACHE_TIMEOUT_DAYS = 7 * 24 * 60 * 60 * 1000 //days

var rtg = require("url").parse(process.env.REDISTOGO_URL);
var redis = require("redis").createClient(rtg.port, rtg.hostname);
redis.auth(rtg.auth.split(":")[1]);

redis.on("error", function (err) {
    console.log("Error " + err);
});

app.get('/resetCache', function (req, res) {
    console.log("Flushing Redis ");
    redis.flushdb(function (err, didSucceed) {
        console.log(didSucceed); // true
    });
    res.write("OK");
    res.end();
});


//URL example: <img src="https://graphgist-status.herokuapp.com/?url=http://gist.neo4j.org/?6019125&execute=true" alt="">
app.get('/', function (req, res) {
    var url = req.query.url;
    var execute = req.query.execute;
    console.log(url, execute);
    var body = 'Checking graphgist at ' + url;
    var OK = 0;
    var FAIL = 1;
    if (execute) {
        runGraphGist(url, res);
    } else {
        redis.get(url, function (err, reply) {
            // reply is null when the key is missing
            console.log("redis reply", reply);

            if (reply) {
                var entry = JSON.parse(reply);
                if (entry.date + CACHE_TIMEOUT_DAYS > new Date().getTime()) {
                    console.log("found cached status " + JSON.stringify(entry));
                    var status = entry.status;
                    send_response(status, res);
                    return;
                }
            }
            runGraphGist(url, res);
        });
    }

    runGraphGist = function (url, res) {
        var childArgs = [path.join(__dirname, './checkstatus.js'), url]
        childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
                var entry = {
                    status: stdout.indexOf("status: Errors") != -1 ? FAIL : OK,
                    date: new Date().getTime()
                }
                redis.set(url, JSON.stringify(entry), redis.print);
                send_response(entry.status, res);
            }
        )
    }

    send_response = function (status, res) {
        console.log("sending response:" + status);
        res.writeHead(200, {'Content-Type': 'image/png' });
//        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        var img = fs.readFileSync('./app/img/fail.png');
        if (status == OK) {
            img = fs.readFileSync('./app/img/ok.png');
        }
        res.end(img, 'binary');
    }

});


app.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
