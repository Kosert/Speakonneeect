function initializeSocket() {
    var socket = io()

    socket.on('connect', function () {
        chat.append("Connected with Id=<b>" + socket.id + "</b>")
    })

    socket.on('channel_update_list', function (newList) {
        channels.updateList(newList)
    })

    socket.on('channel_default', function (channelId){
        socket.emit('join_channel', channelId)
    })

    socket.on('channel_joined', function(userId, channelId, userList){

        if(socket.id == userId)
        {
            channels.currentChannelId = channelId
            channels.refreshCurrentChannel()
            channels.updateUserList(userList)
        }
        else if(channels.currentChannelId == channelId)
        {
            channels.refreshChannelDetails()
            channels.updateUserList(userList)
        }
        chat.append("User <b>" + userId + "</b> joined <b>" + channels.getChannel(channelId).name + "</b>")
    })

    socket.on('message', function(userId, message){
        chat.append("<b>" + userId + "</b>: " + message)
    })

    socketController.socket = socket
}

var socketController = {

    socket = undefined,

    joinChannel: function (channelId)
    {
        socket.emit('join_channel', channelId)
    },
    
    sendMessage: function (message)
    {
        socket.emit('message', message)
    }
}
