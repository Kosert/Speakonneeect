var path = require('path')
var crypto = require('crypto')
var fs = require('fs')

var express = require('express')
var morgan = require('morgan')
var app = express()

var config = require('./config/config')
config.loadConfig()

var httpsOptions = {
    key: fs.readFileSync(config.getConfig.httpsOptions.key),
    cert: fs.readFileSync(config.getConfig.httpsOptions.cert),
    requestCert: true,
    rejectUnauthorized: false
}

var server = require('https').createServer(httpsOptions, app)
var io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, '/public')))
app.use(express.static(path.join(__dirname, '/admin')))
app.use(morgan('dev'))

app.use(checkCert)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/html', 'admin.html'))
})

app.get('/getAdminToken', (req, res) => {
    if (req.adminKey) {
        res.json({ "token": req.adminKey })
    }
    else {
        res.json({ "error": "Certificate error" })        
    }
})

server.listen(8443, () => {
    console.log('Admin server started')
})

const adminKeys = []

function checkCert(req, res, next) {

    const cert = req.socket.getPeerCertificate()

    //TODO check cert and authenticate

    const index = adminKeys.findIndex(element => {
        return element.fingerprint == cert.figerprint
    })
    if (index != -1) {
        req.adminKey = adminKeys[index].adminKey
        return next()
    }

    const newKey = crypto.randomBytes(32).toString('hex')
    const newAdmin = {
        "figerprint": cert.figerprint,
        "adminKey": newKey
    }
    adminKeys.push(newAdmin)
    process.send(newKey)
    req.adminKey = newKey
    return next()
}