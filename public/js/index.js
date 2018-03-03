window.onload = function () {

    var socket = io()

    socket.on('connect', function () {
        chat.append("Connected with Id=\'" + socket.id + "\'")
    })



    console.log('Init completed')
}