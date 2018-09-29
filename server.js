const port = 3030;
const hbs = require('hbs');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

hbs.registerPartials(`${__dirname}/views/partials`);
app.set('view engine', 'hbs')
app.use(express.static(`${__dirname}/public`));

server.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
});

io.on('connection', () => {
    console.log('User Connected.')
});

app.get('/', (req, res) => {
    res.render('index.hbs');
});

app.get('/history', (req, res) => {
    res.render('history.hbs');
});