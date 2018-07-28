const port = 3030;
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);


app.use(express.static(`${__dirname}/public`));

server.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
});

io.on('connection', () => {
    console.log('User Connected.')
});