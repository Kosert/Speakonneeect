window.onload = function () {

    if(!localStorage.userName)
    {
        changeUserName()
    }
    initializeSocket()

    var buttonUsername = document.getElementById("buttonUsername")
    buttonUsername.addEventListener("click", function(){
        changeUserName()
    })

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

function changeUserName() {
    var oldUserName = ""
    if (localStorage.userName) {
        oldUserName = localStorage.userName
    }
    var newUserName = prompt("Please enter your name", oldUserName);

    if (newUserName && newUserName.length < 16 && newUserName != oldUserName) {
        socketController.setName(newUserName)
        localStorage.userName = newUserName
    }
}

function getUserName(user)
{
    if(user.name)
        return user.name
    else
        return user.userId
}

function getQueryParameter(name)
{
       var query = window.location.search.substring(1)
       var vars = query.split("&")
       for (var i=0; i<vars.length; i++) {
               var pair = vars[i].split("=")
               if(pair[0] == name) return pair[1]
       }
       return false
}