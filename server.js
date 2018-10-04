var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [] ;
connections = []  ;
nodes =[]

server.listen(process.env.PORT || 3000) ;
console.log('server running at port 3000');
app.use('/', express.static('public_static'));


//webview for the android app running on iochat


//on disconnect, remove that user from the array of nodes by finding him in that array using his clientId
app.use('/app',express.static('iochat'))
io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket.id);
  socket.on('setNewDevice',function(data){
    nodes.push({clientId: data.clientId, socket: socket})
    console.log(nodes.length);
  })

  socket.on('disconnect',function(data){
    let self = this
    temp = nodes.find(function(obj){

      console.log(self.id);
      return obj.socket.id === self.id;

    });
    console.log(temp.clientId);

  });
});
