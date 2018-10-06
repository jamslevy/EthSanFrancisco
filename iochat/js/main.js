var PVTKEY;
$(function(){
var socket
  console.log('document ready');


  $('#show-form-button').click(function(){

    $(this).css('display','none');
    $('#registration-form').removeClass('hidden')
  })

  $('#device-registration-button').click(function(e){
    e.preventDefault();
    console.log("here ");
    var username = $('input[name="username"]').val();
    //verify from mongo if username is unique
    //if !unique ,
    //warn user to choose new username
    //else save to db, then connect socket with the username

    //write code to send public key to mongoDB for this particular user


    socket = io();
    socket.on('connect',function(){
      socket.emit("verify username", {username: username})
      console.log("connect callaed from front end");
      console.log(username);
      //
      socket.on("verified username",function(bool){
        if(bool){
          alert("username is taken");
        }else{
          console.log("username is correct");
          passPhrase = new Date().getTime().toString()
          console.log(passPhrase);
          pvtKey = window.App.generateRSAKey(passPhrase,512);
          // android call to save this pvtKey to database
          PVTKEY = pvtKey;
          localStorage.setItem(username,JSON.stringify(pvtKey.toJSON()));
          publicKey = window.App.publicKeyString(pvtKey);
          socket.emit('setNewDevice',{clientId: username, publicKey: publicKey});
          alert("your device is now Registered");
          $('h1').html('Your device is now registered');
          $('form').html('');





        }
      })
    });


  })

  $('a').click(function(e){
    var username = $('input[name="username"]').val();
    e.preventDefault();
    socket = io();
    socket.on('connect',function(){
      pvtKey_string = localStorage.getItem(username);
      PVTKEY = window.App.RSAParse(pvtKey_string);
      publicKey = window.App.publicKeyString(PVTKEY);
      socket.emit('login user',{clientId: username, publicKey: publicKey})
    });
    socket.on('send shard to android',function(data){
      console.log("inside send shard to android");

      console.log(data);
      decrypted_object = window.App.decryptObject(data,PVTKEY);
      localStorage.setItem(decrypted_object.identity,decrypted_object.shard);
      //andriod code to store this object

      console.log(decrypted_object);

    });
    $('form').html('');
    $('h1').html('Your device is now logged in');
    waitForRequest(socket)
  })
  function waitForRequest(socket) {
    socket.on('request shard from android',function(data){
      console.log("inside request shard from android");
      decrypted_object = window.App.decryptObject(data,PVTKEY);
      console.log('decrypted_object', decrypted_object);

      shard_to_be_sent = localStorage.getItem(decrypted_object.key);
      console.log(shard_to_be_sent);
      user_to_be_sent = decrypted_object.username
       encrypted_shard = window.App.encryptShardToSendIt(shard_to_be_sent, decrypted_object.publicKey);

       console.log(encrypted_shard);
       socket.emit('send shard to user',{user_to_be_sent: user_to_be_sent, encrypted_shard: encrypted_shard});

    })
  }


})
