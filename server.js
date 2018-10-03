var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [] ;
connections = []  ;

server.listen(process.env.PORT || 3000) ;
console.log('server running at port 3000');
app.use('/', express.static('public_static'));


//webview for the android app running on iochat
app.use('/app',express.static('iochat'))
io.on('connection', function(socket){
  console.log('a user connected');
});
