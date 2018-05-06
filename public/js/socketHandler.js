function initializeSocket(resolve, reject) {

    var options = { query: {} }

    if (localStorage.userName) {
        options.query.name = localStorage.userName
    }

    var channelParameter = getQueryParameter("channel")
    if (channelParameter) {
        options.query.channel = channelParameter
    }

    if ("isAdmin" in window) {
        send("GET", "getAdminToken", null, function (response) {
            options.query.adminToken = response.token
            createSocket(options)
            resolve()
        })
    }
    else {
        createSocket(options)
        resolve()
    }
}

function createSocket(options) {
    //var url = [location.protocol, '//', location.host, location.pathname].join('');
    
    var url = "https://localhost:8080"
    var socket = io(url, options)
    socketController.socket = socket

    currentUser.userId = socket.id

    socket.on('user_connected', function (user) {
        var name = getUserName(user)
        chat.append("User <b>" + name + "</b> connected.")
    })

    socket.on('user_disconnected', function (user) {
        var name = getUserName(user)
        chat.append("User <b>" + name + "</b> disconnected.")
    })
    socket.on('channel_update_list', function (newList) {
        channels.updateList(newList)
    })

    socket.on('channel_default', function (channelId) {
        socket.emit('join_channel', channelId)
    })

    socket.on('channel_joined', function (user, channelId, userList) {

        if (socket.id == user.userId) {
            channels.currentChannelId = channelId
            channels.refreshCurrentChannel()
            channels.updateUserList(userList)
        }
        else if (channels.currentChannelId == channelId) {
            channels.refreshChannelDetails()
            channels.updateUserList(userList)
        }
        currentUser.channelId = channelId
        var name = getUserName(user)
        chat.append("User <b>" + name + "</b> joined <b>" + channels.getChannel(channelId).name + "</b>")
    })

    socket.on('channel_left', function (user) {
        channels.userListRemove(user.userId)
        currentUser.channelId = null        
        var name = getUserName(user)
        chat.append("User <b>" + name + "</b> left your channel.")
    })

    socket.on('message', function (user, message) {
        var name = getUserName(user)
        chat.append("<b>" + name + "</b>: " + message)
    })

    socket.on('name_set', function (user) {
        var previous = channels.getUser(user.userId)

        var previousName = getUserName(previous)
        currentUser.name = user.name

        previous.name = user.name
        chat.append("<b>" + previousName + "</b> set his name to <b>" + user.name + "</b>")
        channels.refreshUserList()
    })
}

var socketController = {

    socket: undefined,

    joinChannel: function (channelId) {
        this.socket.emit('join_channel', channelId)
    },

    sendMessage: function (message) {
        this.socket.emit('message', message)
    },

    setName: function (newName) {
        if (this.socket) {
            this.socket.emit('request_name', newName)
        }
    },

    sendBuffor: function (encodedData) {
        this.socket.emit('clientSendBuffor', encodedData)
    }
}
