var path = require('path')
var crypto = require('crypto')

var express = require('express')
var morgan = require('morgan')
var app = express()

var config = require('./config/config')
config.loadConfig()

var server = require('http').createServer(app)
var io = require('socket.io')(server)

app.use(express.static(path.join(__dirname + '/public')))
app.use(morgan('dev'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', 'index.html'))
})

var adminToken = ""
server.listen(80, () => {
    console.log('Server started')
    crypto.randomBytes(48, (err, buff) => {
        adminToken = buff.toString('hex')
        console.log("New adminToken: " + adminToken)
    })
})

var userList = []

io.on('connection', function (socket) {
    console.log(socket.client.id, '- connected')

    var user = {
        userId: socket.client.id,
        channel: undefined
    }
    if(socket.handshake.query.name)
    {
        user.name = socket.handshake.query.name
    }

    userList.push(user)

    io.emit('user_connected', { 
        userId: user.userId,
        name: user.name
    })
    socket.emit('channel_update_list', config.getChannelList())

    if(socket.handshake.query.channel)
        socket.emit('channel_default', socket.handshake.query.channel)
    else
        socket.emit('channel_default', config.getConfig.default_channel_id)

    socket.on('request_name', function(name){
        if(name && name.length < 16)
        {
            user.name = name
            io.emit('name_set', {userId: user.userId, name: user.name})
        }
    })

    socket.on('join_channel', function (channelId) {

        var channel = config.getConfig.channels.find(element => {
            return element.id === channelId
        })

        if (channel) {
            if (user.channel) {
                socket.leave(user.channel.id)
                io.to(user.channel.id).emit('channel_left', {userId: user.userId, name: user.name})                
                user.channel.users--
                user.channel = undefined
            }

            socket.join(channelId)
            user.channel = channel
            channel.users++

            var channelUsers = []
            userList.forEach(element => {
                if(element.channel){
                    if(element.channel.id == channelId)
                    channelUsers.push(element)
                }
            })

            io.emit('channel_update_list', config.getChannelList())
            io.emit('channel_joined', {userId: user.userId, name: user.name}, channel.id, channelUsers)
        }
        else {
            console.log("error - invalid channelId")
        }
    })

    socket.on('message', function(message){
        io.to(user.channel.id).emit('message', {userId: user.userId, name: user.name}, message)
    })

    socket.on('disconnect', function () {
        console.log(user.userId, '- disconnected')

        if (user.channel) {
            socket.leave(user.channel.id)
            io.to(user.channel.id).emit('channel_left', {userId: user.userId, name: user.name})
            user.channel.users--
            user.channel = undefined
        }

        var userIndex = userList.findIndex(element => {
            return element.userId == user.userId
        })
        userList.splice(userIndex, 1)

        io.emit('channel_update_list', config.getChannelList())
        io.emit('user_disconnected', {userId: user.userId, name: user.name})
    });
})