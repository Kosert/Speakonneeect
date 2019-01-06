window.onload = function () {

    new Promise(initializeSocket).then(function () {
        var buttonUsername = document.getElementById("buttonUsername")
        buttonUsername.addEventListener("click", function (e) {
            e.preventDefault()
            changeUserName()
        })

        var sendButton = document.getElementById("sendButton")
        var sendContent = document.getElementById("sendContent")
        sendContent.addEventListener("keypress", function (e) {
            var key = e.which || e.keyCode;
            if (key === 13) { // 13 is enter
                if (!sendContent.value) return
                socketController.sendMessage(sendContent.value)
                sendContent.value = ""
            }
        })
        sendButton.addEventListener("click", function () {
            if (!sendContent.value) return
            socketController.sendMessage(sendContent.value)
            sendContent.value = ""
        })

        var main = document.getElementById("main")
        var xd = document.getElementById("XD")
        var xdButton = document.getElementById("xdButton")

        xdButton.addEventListener('click', function() {
            xd.hidden = true
            main.hidden = false
        })

        console.log('Init completed')
    })
}
    
var currentUser = {}

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

function getUserName(user) {
    if (user.name)
        return user.name
    else
        return user.userId
}

function getQueryParameter(name) {
    var query = window.location.search.substring(1)
    var vars = query.split("&")
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=")
        if (pair[0] == name) return pair[1]
    }
    return false
}

function send(method, path, data, callback) {
    var req = new XMLHttpRequest()
    req.open(method, path, true)
    req.responseType = 'json'
    req.setRequestHeader("Content-Type", "application/json")
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            callback(req.response)
        }
    }
    req.send(JSON.stringify(data))
}