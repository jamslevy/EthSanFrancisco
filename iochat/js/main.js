var PVTKEY;
$(function(){

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
          pvtKey = window.App.generateRSAKey(passPhrase,256);
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
    });
    $('form').html('');
    $('h1').html('Your device is now logged in');
  })

})
