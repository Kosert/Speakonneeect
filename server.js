var path = require('path')

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

server.listen(80, () => {
    console.log('Server started')
})

var userList = []

io.on('connection', function (socket) {
    console.log(socket.client.id, '- connected')
    //TODO IO.EMIT CONNECT

    var user = {
        userId: socket.client.id,
        channel: undefined
    }

    userList.push(user)

    socket.emit('channel_update_list', config.getConfig.channels)
    socket.emit('channel_default', config.getConfig.default_channel_id)

    socket.on('join_channel', function (channelId) {

        var channel = config.getConfig.channels.find(element => {
            return element.id === channelId
        })

        if (channel) {
            if (user.channel) {
                //io.to(user.channel.id).emit('channel_left')
                socket.leave(user.channel.id)
                user.channel.users--
                user.channel = undefined
            }

            socket.join(channelId)
            user.channel = channel
            channel.users++

            var channelUsers = []
            userList.forEach(element => {
                if(element.channel.id == channelId)
                    channelUsers.push(element.userId)
            })

            io.emit('channel_update_list', config.getConfig.channels)
            io.emit('channel_joined', user.userId, channel.id, channelUsers)
        }
        else {
            console.log("error - invalid channelId")
        }
    })

    socket.on('message', function(message){
        io.to(user.channel.id).emit('message', user.userId, message)
    })

    socket.on('disconnect', function () {
        console.log(user.userId, '- disconnected')

        if (user.channel) {
            socket.leave(user.channel.id)
            user.channel.users--
            user.channel = undefined
        }

        var userIndex = userList.findIndex(element => {
            return element.userId == user.userId
        })
        userList.splice(userIndex, 1)

        io.emit('channel_update_list', config.getConfig.channels)
        //io.emit('user_disconnected')
    });
})