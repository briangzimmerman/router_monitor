const port = 3030;
const hbs = require('hbs');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const config = require('./config.json');
const TpLink = require('./utils/TpLink');
const {mongoose} = require('./db/mongoose');
const {Device} = require('./db/models/device');
const {Traffic} = require('./db/models/traffic');

var router = new TpLink(config.ip, config.username, config.password);
var traffic_interval = false;


//------------------------------- Server Pages ---------------------------------

hbs.registerPartials(`${__dirname}/views/partials`);
app.set('view engine', 'hbs')
app.use(express.static(`${__dirname}/public`));

server.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
});

io.on('connection', (socket) => {
    console.log('User Connected.');

    if(!router.isLoggedIn()) {
        console.log('Logging in');

        router.login()
        .then(() => {
            traffic_interval = createService();
        });
    }

    Device.find()
    .then((devices) => {
        socket.emit('devices', devices);
    });

    socket.on('join', (room) => {
        socket.join(room);
    });

    socket.on('disconnect', () => {
        if(!io.engine.clientsCount) {
            console.log('Logging out');

            clearInterval(traffic_interval);
            router.logout();
        }
    });
});

app.get('/', (req, res) => {
    res.render('index.hbs');
});

app.get('/history', (req, res) => {
    var devices;

    Device.find()
    .then((d) => {
        devices = d;
        return Traffic.find();
    })
    .then((history) => {
        res.render('history.hbs', {
            history: JSON.stringify(history),
            devices: JSON.stringify(devices)
        });
    })
});

//------------------------------- Router Stuff ---------------------------------

router.login()
.then(() => {
    traffic_interval = createService();
});

//--------------------------------- Functions ----------------------------------

function createService() {
    return setInterval(() => {
        router.getTraffic()
        .then((traffic) => {
            io.to('traffic').emit('traffic_update', traffic);
        });
    }, 5000);
}