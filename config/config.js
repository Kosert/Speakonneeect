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

function save() {
    var json = JSON.stringify(config)
    fs.writeFileSync('config.json', json, { encoding: 'utf8' })
}

function load() {
    if (!fs.existsSync('config.json')) {
        save()
    }
    var contents = fs.readFileSync('config.json', 'utf8')
    config = JSON.parse(contents)
}

module.exports = {
    saveConfig: save,
    loadConfig: load,
    getConfig: config
}