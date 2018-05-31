var path = require('path')
var crypto = require('crypto')
var fs = require('fs')

var express = require('express')
var morgan = require('morgan')
var app = express()

var config = require('./config/config')
config.loadConfig()

var httpsOptions = {
    key: fs.readFileSync(config.getConfig.httpsOptions.key),
    cert: fs.readFileSync(config.getConfig.httpsOptions.cert)
}

var server = require('https').createServer(httpsOptions, app)
var io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, '/public')))
app.use(morgan('dev'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/html', 'index.html'))
})

server.listen(8080, () => {
    console.log('Server started')
})

var userList = []

var fork = require('child_process').fork
var adminServer = fork(__dirname + '/adminServer.js')

const adminList = []

adminServer.on('message', function (newAdmin) {
    console.log("new Admin: ", newAdmin)
    adminList.push(newAdmin)
})

io.on('connection', function (socket) {
    console.log(socket.client.id, '- connected')
	var newId = socket.client.id;
	
	io.to(newId).emit('id_for_client', newId);
	
	
    var user = {
        userId: socket.client.id,
        channel: undefined,
        isAdmin: false
    }
    if (socket.handshake.query.name) {
        user.name = socket.handshake.query.name
    }
    if (socket.handshake.query.adminToken) {
        user.isAdmin = adminList.includes(socket.handshake.query.adminToken)
    }

    userList.push(user)

    io.emit('user_connected', {
        userId: user.userId,
        name: user.name,
        isAdmin: user.isAdmin
    })
    socket.emit('channel_update_list', config.getChannelList())

    if (socket.handshake.query.channel)
        socket.emit('channel_default', socket.handshake.query.channel)
    else
        socket.emit('channel_default', config.getConfig.default_channel_id)

    socket.on('request_name', function (name) {
        if (name && name.length < 16) {
            user.name = name
            io.emit('name_set', { userId: user.userId, name: user.name })
        }
    })

    socket.on('join_channel', function (channelId) {

        var channel = config.getConfig.channels.find(element => {
            return element.id === channelId
        })

        if (channel) {
            if (user.channel) {
                socket.leave(user.channel.id)
                io.to(user.channel.id).emit('channel_left', { userId: user.userId, name: user.name })
                user.channel.users--
                user.channel = undefined
            }

            socket.join(channelId)
            user.channel = channel
            channel.users++

            var channelUsers = []
            userList.forEach(element => {
                if (element.channel) {
                    if (element.channel.id == channelId)
                        channelUsers.push({
                            "userId": element.userId,
                            "name": element.name,
                            "isAdmin": element.isAdmin
                        })
                }
            })

            io.emit('channel_update_list', config.getChannelList())
            io.emit('channel_joined', { userId: user.userId, name: user.name }, channel.id, channelUsers)
        }
        else {
            console.log("error - invalid channelId")
        }
    })

    socket.on('message', function (message) {
        io.to(user.channel.id).emit('message', { userId: user.userId, name: user.name }, message)
    })



	
    socket.on('clientSendBuffor', function (data) {
        if (!user.channel) return
        socket.broadcast.to(user.channel.id).emit('serverSendBuffor', data)
    })

    socket.on('disconnect', function () {
        console.log(user.userId, '- disconnected')

        if (user.channel) {
            socket.leave(user.channel.id)
            io.to(user.channel.id).emit('channel_left', { userId: user.userId, name: user.name })
            user.channel.users--
            user.channel = undefined
        }

        var userIndex = userList.findIndex(element => {
            return element.userId == user.userId
        })
        userList.splice(userIndex, 1)

        io.emit('channel_update_list', config.getChannelList())
        io.emit('user_disconnected', { userId: user.userId, name: user.name })
    });
})
