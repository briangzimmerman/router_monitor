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


//------------------------------- Server Pages ---------------------------------

hbs.registerPartials(`${__dirname}/views/partials`);
app.set('view engine', 'hbs')
app.use(express.static(`${__dirname}/public`));

server.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
});

io.on('connection', (socket) => {
    console.log('User Connected.');

    Device.find()
    .then((devices) => {
        socket.emit('devices', devices);
    });

    socket.on('join', (room) => {
        socket.join(room);
    });
});

app.get('/', (req, res) => {
    res.render('index.hbs');
});

app.get('/history', (req, res) => {
    res.render('history.hbs');
});

//------------------------------- Router Stuff ---------------------------------

router.login()
.then(() => {
    createService();
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