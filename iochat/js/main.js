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
          publicKey = window.App.publicKeyString(pvtKey);
          socket.emit('setNewDevice',{clientId: username, publicKey: publicKey});
          alert("your device is now Registered");
          window.location.href = 'http://localhost:3000/app/registered'


        }
      })
    })

  })

})
