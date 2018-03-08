var chat = {

    append: function (message) {

        var chatElement = document.getElementById("chat")

        var date = new Date()
        var timeText = "<" + date.toLocaleTimeString() + "> "
        var timestamp = document.createElement("b")
        timestamp.appendChild(document.createTextNode(timeText))

        var li = document.createElement("li")
        li.classList.add("px-2")
        li.appendChild(timestamp)
        li.innerHTML += message

        chatElement.appendChild(li)
        this.updateScroll()
    },

    updateScroll: function(){
        var element = document.getElementById("chat");
        element.scrollTop = element.scrollHeight;
    }
}

var channels = {

    currentList: [],
    currentChannelId: "",

    getChannel: function (channelId) {
        for (var channel of this.currentList) {
            if (channel.id == channelId)
                return channel
        }
    },

    updateList: function (newList) {
        var ul = document.getElementById("channelList")
        ul.innerHTML = ''
        newList.forEach(channel => {
            var li = this.createChannelElement(channel)
            ul.appendChild(li)
        })
        this.currentList = newList
        this.refreshCurrentChannel()
    },

    createChannelElement: function (channel) {
        var li = document.createElement('li')
        li.classList.add("channel-element", "list-group-item", "d-flex", "justify-content-between", "align-items-center", "list-group-item-action")

        var nameNode = document.createTextNode(channel.name)
        li.appendChild(nameNode)

        var span = document.createElement("span")
        span.classList.add("badge", "badge-dark", "badge-pill")
        span.innerText = channel.users + " users"
        li.appendChild(span)

        li.setAttribute("data-id", channel.id)

        li.addEventListener("click", function () {
            socketController.joinChannel(channel.id)
        })

        return li
    },

    refreshCurrentChannel: function () {
        var ul = document.getElementById("channelList")
        for (var i = 0; i < ul.children.length; i++) {
            var li = ul.children[i]
            var id = li.getAttribute("data-id")
            li.classList.remove("list-group-item-dark")
            if (this.currentChannelId == id) {
                li.classList.add("list-group-item-dark")
            }
        }
        this.refreshChannelDetails()
    },

    refreshChannelDetails: function () {
        var channel = this.getChannel(this.currentChannelId)
        var p = document.getElementById("channelDetails")

        if (!channel) {
            p.innerHTML = ""
            return
        }

        var name = "Channel name: " + channel.name + "<br>"
        var id = "Channel ID: " + channel.id + "<br>"
        var users = "Active users: " + channel.users
        p.innerHTML = name + id + users
    },

    userList: [],

    updateUserList: function(newList) {
        this.userList = newList
        this.refreshUserList()
    },

    refreshUserList: function(){
        var ul = document.getElementById("userList")
        ul.innerHTML = ''
        this.userList.forEach(user => {
            var li = this.createUserElement(user)
            ul.appendChild(li)
        })
    },
    
    userListRemove: function(userId){
        var removeIndex = this.userList.findIndex(element => {
            return userId == element.userId
        })

        this.userList.splice(removeIndex, 1)
        this.refreshUserList()
    },
  
    createUserElement: function (user) {
        var li = document.createElement('li')
        li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center", "list-group-item-action")

        var nameNode = document.createTextNode(user.userId)
        li.appendChild(nameNode)

        return li
    }
}

