var chat = {

    append: function(message) {

        var chatElement = document.getElementById("chat")
    
        var date = new Date()
        var timeText = "<" + date.toLocaleTimeString() + "> "
        var timestamp = document.createElement("b")
        timestamp.appendChild(document.createTextNode(timeText))
    
        var li = document.createElement("li")
        li.classList.add("px-2")
        li.appendChild(timestamp)
        li.appendChild(document.createTextNode(message))
        
        chatElement.appendChild(li)
    }


}