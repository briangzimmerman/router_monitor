const md5 = require('md5');
const rp = require('request-promise');
const util = require('util');

const loginURL = 'http://%s/userRpm/LoginRpm.htm?Save=Save';
const logoutURL = 'http://%s/%s/userRpm/LogoutRpm.htm';
const rebootURL = 'http://%s/%s/userRpm/SysRebootRpm.htm';
const trafficURL = 'http://%s/%s/userRpm/StatusRpm.htm';
const sessionRegex = /http:\/\/[0-9a-zA-Z.]+\/([A-Z]{16})\/userRpm\/Index\.htm/;
const trafficArrayRegex = /var statistList = (.*?);\s*/;

class TpLink {
    constructor(ip, username, password) {
        this.ip = ip;
        this.loggedIn = false;
        this.sessionId = false;
        this.cookie = 'Basic ' + Buffer.from(`${username}:` + md5(password)).toString('base64');
    }
//------------------------------------------------------------------------------

    login() {
        return rp({uri: `http://${this.ip}`})
        .then(() => {
            return rp({
                uri: util.format(loginURL, this.ip),
                headers: {
                    'Authorization': this.cookie
                }
            });
        })
        .then((response) => {
            console.log(response);

            var matches = response.match(sessionRegex);
            if(matches.length != 2) { return; }

            this.sessionId = matches[1];
            this.loggedIn = true;
        });
    }
//------------------------------------------------------------------------------

    logout() {
        if(!this.loggedIn) { return; }

        return rp({
            uri: util.format(logoutURL, this.ip, this.sessionId),
            headers: {
                'Authorization': this.cookie,
                'Referer': util.format(trafficURL, this.ip, this.sessionId)
            }
        })
        .then(() => {
            this.loggedIn = false;
            this.sessionId = false;
        });
    }
//------------------------------------------------------------------------------

    reboot() {
        if(!this.loggedIn) { return; }

        return rp({
            uri: util.format(rebootURL, this.ip, this.sessionId) + '?Reboot=Reboot',
            headers: {
                'Authorization': this.cookie,
                'Referer': util.format(rebootURL, this.ip, this.sessionId)
            }
        });
    }
//------------------------------------------------------------------------------

    getTraffic() {
        if(!this.loggedIn) { return; }

        return rp({
            uri: util.format(trafficURL, this.ip, this.sessionId),
            headers: {
                'Authorization': this.cookie,
                'Referer': util.format(trafficURL, this.ip, this.sessionId)
            }
        })
        .then((response) => {
            console.log(response);

            var matches = response.match(trafficArrayRegex);
            if(matches.length != 2) { return []; }

            var traffic = [];

            eval(matches[1]).forEach((host) => {
                // traffic.push([host[1], host[5]]);
            });

            return traffic;
        });
    }
}

module.exports = TpLink;