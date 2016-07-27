import sockjs = require("sockjs-client");
import request = require("request");

let sock = new sockjs("https://screeps.com/socket");
let config = require("./console.json");

sock.onopen = function () {
    let auth = {
        url: "https://screeps.com/api/auth/signin",
        json: true,
        body: {
            email: config.user,
            password: config.password
        }
    };
    request.post(auth, function (err, httpResponse, body) {
        let token = body.token;
        let info = {
            url: "https://screeps.com/api/auth/me",
            json: true,
            headers: {
                "X-Token": token,
                "X-Username": config.user,
            },
        };
        request.get(info, function (err, httpResponse, body) {
            sock.send("auth " + token);
            sock.send("subscribe user:" + body._id + "/console");
        });
    });
};

sock.onmessage = function (message) {
    try {
        let json = JSON.parse(message.data);
        if (json[0] && json[1] && json[1].messages && json[1].messages.log) {
            let log = json[1].messages.log;
            for (let i in log) {
                console.log(new Date(message.timeStamp), log[i]);
            }
        }
    }
    catch (e) {
    }
};

sock.onclose = function () {
};