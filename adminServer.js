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

server.listen(8443, () => {
    console.log('Admin server started')
})


function checkCert(req, res, next) {

    //TODO check cert and authenticate
    //req.socket.getPeerCertificate()
    next()
}