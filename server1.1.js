/* ===DANE=== */
/* ---PORTY--- */
var SSLPORT = 443; 

/* ---CERTYFIKAT RSA--- */
var privateKeyPath = "./cert/key.pem"; 
var certificatePath = "./cert/cert.pem"; 

/* ---MODUŁY NODE--- */
var fs = require('fs');
var https = require('https');
var express = require('express'); // (!)narzędzia do serwerów http, dobre do 1 stronowych stronek

/* ===SETUP SERWERA=== */
var server_utilities = express();
server_utilities.use(express.static('webcontent')); // (!) powiązanie narzędzi serwera z asetami do stronki

var privateKey = fs.readFileSync( privateKeyPath );
var certificate = fs.readFileSync( certificatePath );

/* ---SERWER HTTPS NA PORCIE SSL--- */
var server = https.createServer({
    key: privateKey,
    cert: certificate
}, server_utilities).listen(SSLPORT);

console.log("Webserver & Socketserver running on port: "+SSLPORT);

/* ===LOGIKA SERWERA=== */
/* ---SŁUCHANIE TRANSMISJI--- */
var io  = require('socket.io').listen(server, { log: false });

/* ---OBSŁUGA KLIJENTÓW--- */

io.sockets.on('connect', function (socket) {  

	console.log("huj");
	
	
	socket.on('clientSendBuffor', function (data) {
				
		socket.broadcast.emit('serverSendBuffor', data); 
	});
});