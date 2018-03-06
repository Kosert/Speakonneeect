window.onload = function () {

    initializeSocket()

    var sendButton = document.getElementById("sendButton")
    var sendContent = document.getElementById("sendContent")
    sendContent.addEventListener("keypress", function(e){
        var key = e.which || e.keyCode;
        if (key === 13) { // 13 is enter
            if(!sendContent.value) return
            socketController.sendMessage(sendContent.value)
            sendContent.value = ""
        }
    })
    sendButton.addEventListener("click", function(){
        if(!sendContent.value) return
        socketController.sendMessage(sendContent.value)
        sendContent.value = ""
    })

    console.log('Init completed')
}