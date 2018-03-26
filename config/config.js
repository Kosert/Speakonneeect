var fs = require('fs')

//defaults:
var config = {
    default_channel_id: "234",
    channels: [
        {   
            id: "234",
            name: "Default channel",
            users: 0
        },
        {
            id: "345",
            name: "Pokoik 1",
            users: 0
        }
    ]
}

function channelList() {

    var list = []
    config.channels.forEach((element, index) => {
        list.push({
            id: element.id,
            name: element.name,
            users: element.users,
        })
    })
    return list
}

function save() {
    var toSave = Object.assign({}, config)
    toSave.channels.forEach((element, index) => {
        delete element.users
    })

    var json = JSON.stringify(config)
    fs.writeFileSync('config.json', json, { encoding: 'utf8' })
}

function load() {
    if (!fs.existsSync('config.json')) {
        save()
    }
    var contents = fs.readFileSync('config.json', 'utf8')
    Object.keys(config).forEach((key) => { delete config[key] })

    Object.assign(config, JSON.parse(contents))
    config.channels.forEach((element, index) => {
        element.users = 0
    })
}

module.exports = {
    saveConfig: save,
    loadConfig: load,
    getConfig: config,
    getChannelList: channelList
}