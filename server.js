var path = require('path')

var express = require('express')
var morgan = require('morgan')
var app = express()

var server = require('http').createServer(app)
var io = require('socket.io')(server)

app.use(express.static(path.join(__dirname + '/public')))
app.use(morgan('dev'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', 'index.html'))
})

server.listen(80, () => {
    console.log('Server started')
})

io.on('connection', function (socket) {
    console.log(socket.client.id, '- connected');

    socket.on('disconnect', function(){
        console.log(socket.client.id, '- disconnected');
      });
})