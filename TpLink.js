const md5 = require('md5');
const rp = require('request-promise');
const util = require('util');

const loginURL = 'http://%s/userRpm/LoginRpm.htm?Save=Save';
const logoutURL = 'http://%s/%s/userRpm/LogoutRpm.htm';
const rebootURL = 'http://%s/%s/userRpm/SysRebootRpm.htm';
const trafficURL = 'http://%s/%s/userRpm/StatusRpm.htm';
const sessionRegex = '';
const trafficArrayRegex = '';

class TpLink {
    constructor(username, password, ip) {
        this.ip = ip;
        this.loggedIn = false;
        this.sessionId = false;
        this.cookie = 'Basic ' + Buffer.from(`${username}:` + md5(password)).toString('base64');
        rp({uri: `http://${this.ip}`}).then(login);
    }
//------------------------------------------------------------------------------

    login() {
        return rp({
            uri: util.format(loginURL, this.ip),
            headers: {
                'Authorization': this.cookie
            }
        })
        .then((response) => {
            console.log(response);
        });
    }
//------------------------------------------------------------------------------

    logout() {
        if(!this.loggedIn) { return; }

        return rp({
            uri: util.format(logoutURL, this.ip, this.sessionId),
            headers: {
                'referer': util.format(trafficURL, this.ip, this.sessionId)
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
            uri: util.format(rebootURL, this.ip, this.sessionId),
            headers: {
                'referer': util.format(trafficURL, this.ip, this.sessionId)
            }
        });
    }
//------------------------------------------------------------------------------

    getTraffic() {
        if(!this.loggedIn) { return; }

        rp({
            uri: util.format(trafficURL, this.ip, this.sessionId)
        })
        .then((response) => {
            console.log(response);
        });
    }
}

module.exports = TpLink;