const md5 = require('md5');
const rp = require('request-promise');

class TpLink {
    constructor(username, password, ip) {
        this.ip = ip;
        this.loggedIn = false;
        this.sessionId = false;
        this.cookie = 'Basic ' + Buffer.from(`${username}:` + md5(password)).toString('base64');
        rp({uri: `http://${this.ip}`}).then(login);
    }

    login() {
        return rp({
            uri: `http://${this.ip}/userRpm/LoginRpm.htm?Save=Save`,
            headers: {
                'Authorization': this.cookie
            }
        })
        .then((response) => {
            console.log(response);
        });
    }
}