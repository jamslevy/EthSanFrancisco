var express = require('express');
var app = express();
var server = require('http').createServer(app);
const mongo = require('./mongo.js');
var io = require('socket.io').listen(server);


users = [] ;
connections = []  ;
nodes =[]

server.listen(process.env.PORT || 3000,'0.0.0.0',function(){
  mongo.connect()
}) ;
console.log('server running at port 3000');
app.use('/', express.static('public_static'));
app.get('/app/registered', function(req,res){
  res.sendFile(__dirname + '/iochat/registered.html')
})


//webview for the android app running on iochat

app.use('/app',express.static('iochat'))
io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket.id);

  socket.on('disconnect',function(data){
    console.log('inside disconnect');
    console.log(data);
    let self = this
    temp = nodes.find(function(obj){


      return obj.socket.id === self.id;

    });

    i = nodes.indexOf(temp);
    console.log('user with ',i, 'disconnected');
    nodes.splice(i,1);



  });
  socket.on('verify username', function(data){
    console.log("inside verify username");
    mongo.checkAndroidUser(data.username).then(function(bool){

      socket.emit('verified username',bool);

    })
  });
  socket.on('setNewDevice',function(data){
    console.log("setNewDevice");
    nodes.push({clientId: data.clientId, socket: socket})
    mongo.addAndroidUser(data.clientId,"",data.publicKey)
    console.log(nodes.length);
  })
  socket.on('login user',function(data){
    nodes.push({clientId: data.clientId, socket: socket});
    console.log('user logged in successfully');
    console.log(socket.id);
  })

  // for webapp

  socket.on('get user count',function(){
    var usercount = mongo.getNumberOfAndroidUsers;
    socket.emit('user count',usercount)
  });
  socket.on('get user data',function(index){
    console.log('inside get user data');
    console.log(index);
    mongo.getAndroidUserDetailsForEncryption(index).then(function(obj){
      socket.emit('user data',obj);
    })
  });
  socket.on('send shards', function(array){
    console.log('***');
    console.log(array);
    console.log('***');
    array.forEach(function(element){

      console.log('length of nodes',nodes.length);
      correct_node= nodes.find(function(incorrect_node){
        console.log('incorrect_node clientID', incorrect_node.clientId);
        return incorrect_node.clientId == element.username;
      });
      correct_socket = correct_node.socket;
      console.log("correct_socket id", correct_socket.id);
      correct_socket.emit('send shard to android',element.data);
      console.log(element);
    })
  })
  socket.on('request shards',function(array){
    array.forEach(function(element){
      correct_node = nodes.find(function(incorrect_node){
        return incorrect_node.clientId == element.username;
      });
      correct_socket = correct_node.socket;
      correct_socket.emit('request shard from android', element.data);

    })
  })
  socket.on('send shard to user',function(data){
    console.log('inside send shard to user',data);
    correct_node = nodes.find(function(incorrect_node){
      return incorrect_node.clientId == data.user_to_be_sent;
    });
    correct_socket = correct_node.socket;
    correct_socket.emit('send encrypted shard to user',data.encrypted_shard)
  })
});
