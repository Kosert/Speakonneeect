var path = require('path')
var crypto = require('crypto')
var fs = require('fs')

var express = require('express')
var morgan = require('morgan')
var app = express()

var config = require('./config/config')
config.loadConfig()

var httpsOptions = {
    regular: {
        key: fs.readFileSync(config.getConfig.httpsOptions.key),
        cert: fs.readFileSync(config.getConfig.httpsOptions.cert)
    },
    admin: {
        key: fs.readFileSync(config.getConfig.httpsOptions.key),
        cert: fs.readFileSync(config.getConfig.httpsOptions.cert),
        requestCert: true,
        rejectUnauthorized: false
    }
}
var server = require('https').createServer(httpsOptions.regular, app)
var io = require('socket.io')(server)

app.use(express.static(path.join(__dirname + '/public')))
app.use(morgan('dev'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/html', 'index.html'))
})

server.listen(8080, () => {
    console.log('Server started')
})

var userList = []

io.on('connection', function (socket) {
    console.log(socket.client.id, '- connected')

    var user = {
        userId: socket.client.id,
        channel: undefined
    }
    if (socket.handshake.query.name) {
        user.name = socket.handshake.query.name
    }

    userList.push(user)

    io.emit('user_connected', {
        userId: user.userId,
        name: user.name
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
                        channelUsers.push(element)
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
        if(!user.channel) return
        socket.to(user.channel.id).emit('serverSendBuffor', data)
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

var adminHtml = fs.readFileSync(path.join(__dirname, "/html", "/admin.html"), { encoding: "utf8" })

var adminServer = require('https').createServer(httpsOptions.admin, function (req, res) {
    //TODO check cert and authenticate

    console.log(req.socket.getPeerCertificate())
    var filePath = ""

    switch (req.url) {
        case '/':
            filePath = path.join(__dirname, "/html", "/admin.html")
            res.writeHead(200, { "Content-Type": "text/html" })
            res.end(adminHtml)
            break
        case '/js/index.js':
            filePath = path.join(__dirname, "/public", "/js", "/index.js")
            res.writeHead(200, { "Content-Type": "text/javascript" })
            break
        case '/js/socketHandler.js':
            filePath = path.join(__dirname, "/public", "/js", "/socketHandler.js")
            res.writeHead(200, { "Content-Type": "text/javascript" })
            break
        case '/js/ui.js':
            filePath = path.join(__dirname, "/public", "/js", "/ui.js")
            res.writeHead(200, { "Content-Type": "text/javascript" })
            break
        case '/js/audiorecorder.min.js':
            filePath = path.join(__dirname, "/public", "/js", "/audiorecorder.min.js")
            res.writeHead(200, { "Content-Type": "text/javascript" })
            break
        case '/js/worker.min.js':
            filePath = path.join(__dirname, "/public", "/js", "/worker.min.js")
            res.writeHead(200, { "Content-Type": "text/javascript" })
            break
        case '/img/favicon.ico':
            filePath = path.join(__dirname, "/public", "/img", "/favicon.ico")
            res.writeHead(200, { "Content-Type": "image/x-icon" })
            break
        case '/img/logo.png':
            filePath = path.join(__dirname, "/public", "/img", "/logo.png")
            res.writeHead(200, { "Content-Type": "image/png" })
            break
        default:
            res.writeHead(404)
            res.end()
            console.log(req.url, "ERR - PATH NOT RECOGNIZED")
            break
    }
    if (!filePath) return

    fs.readFile(filePath, function (err, data) {
        if (!err) {
            res.end(data)
        } else {
            res.writeHead(404)
            res.end()
            console.log(req.url, "ERROR")
        }
    })
})
adminServer.listen(8443)