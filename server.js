var path = require('path')

var express = require('express')
var morgan = require('morgan')
var app = express()


app.use(express.static(path.join(__dirname + '/public')))
app.use(morgan('dev'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', 'index.html'))
})

app.listen(80, () => {
    console.log('Server started')
})