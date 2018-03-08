function initializeSocket() {
    socket = io()
    socketController.socket = socket

    socket.on('user_connected', function (userId) {
        chat.append("User <b>" + userId + "</b> connected.")
    })

    socket.on('user_disconnected', function (userId) {
        chat.append("User <b>" + userId + "</b> disconnected.")
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

    socket.on('channel_left', function(userId){
        channels.userListRemove(userId)
        chat.append("User <b>" + userId + "</b> left your channel.")
    })

    socket.on('message', function(userId, message){
        chat.append("<b>" + userId + "</b>: " + message)
    })
}

var socketController = {

    socket: undefined,

    joinChannel: function (channelId)
    {
        socket.emit('join_channel', channelId)
    },
    
    sendMessage: function (message)
    {
        socket.emit('message', message)
    }
}
