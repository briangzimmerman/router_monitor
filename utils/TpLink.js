const md5 = require('md5');
const rp = require('request-promise');
const util = require('util');

const loginURL = 'http://%s/userRpm/LoginRpm.htm?Save=Save';
const logoutURL = 'http://%s/%s/userRpm/LogoutRpm.htm';
const rebootURL = 'http://%s/%s/userRpm/SysRebootRpm.htm';
const trafficURL = 'http://%s/%s/userRpm/SystemStatisticRpm.htm';
const sessionRegex = /http:\/\/[0-9a-zA-Z.]+\/([A-Z]{16})\/userRpm\/Index\.htm/;
const trafficArrayRegex = /var statList = (new Array\([^<]*\));/;

class TpLink {
    constructor(ip, username, password) {
        this.ip = ip;
        this.sessionId = false;
        this.cookie = 'Basic ' + Buffer.from(`${username}:` + md5(password)).toString('base64');
    }
//------------------------------------------------------------------------------

    isLoggedIn() {
        return this.sessionId != false;
    }
//------------------------------------------------------------------------------

    login() {
        return rp({uri: `http://${this.ip}`})
        .then(() => {
            return rp({
                uri: util.format(loginURL, this.ip),
                headers: {
                    'Cookie': `Authorization=${this.cookie}`
                }
            });
        })
        .then((response) => {
            var matches = response.match(sessionRegex);
            if(!matches) { return; }

            this.sessionId = matches[1];
        })
        .catch((err) => { console.log(err); });
    }
//------------------------------------------------------------------------------

    logout() {
        return rp({
            uri: util.format(logoutURL, this.ip, this.sessionId),
            headers: {
                'Cookie': `Authorization=${this.cookie}`,
                'Referer': util.format(trafficURL, this.ip, this.sessionId)
            }
        })
        .then(() => {
            this.sessionId = false;
        })
        .catch((err) => { console.log(err); });
    }
//------------------------------------------------------------------------------

    reboot() {
        return rp({
            uri: util.format(rebootURL, this.ip, this.sessionId) + '?Reboot=Reboot',
            headers: {
                'Cookie': `Authorization=${this.cookie}`,
                'Referer': util.format(rebootURL, this.ip, this.sessionId)
            }
        })
        .then(() => {
            this.sessionId = false;
        })
        .catch((err) => { console.log(err); });
    }
//------------------------------------------------------------------------------

    getTraffic() {
        var uri = util.format(trafficURL, this.ip, this.sessionId) +
            '?Refresh=Refresh&Num_per_page=100&Goto_page=1&sortType=1&interval=5';

        return rp({
            uri,
            headers: {
                'Cookie': `Authorization=${this.cookie}`,
                'Referer': uri
            }
        })
        .then((response) => {
            var matches = response.match(trafficArrayRegex);
            if(!matches) { return []; }

            var traffic = [];
            var stats = eval(matches[1]);

            for(var idx = 0; idx < stats.length - 2; idx += 13) {
                traffic.push({
                    ip: stats[idx + 1],
                    bytes: stats[idx + 6]
                });
            }

            return traffic;
        })
        .catch((err) => { console.log(err); });
    }
}

module.exports = TpLink;