var PVTKEY;
$(function(){
var socket
  console.log('document ready');
  // alert(Android);

var registration_button = $('.show-form-button').first();
var login_button = $('.show-form-button').last()
  $('.show-form-button').click(function(){


    $('form').removeClass('hidden');
    console.log($(this).html());
    if($(this).html() != 'Register this device'){
      registration_button.removeClass('hidden')
      login_button.addClass('hidden')
      $('#device-login-button').removeClass('hidden');
      $('#device-registration-button').addClass('hidden');
      console.log("inside if");
    }else{
      registration_button.addClass('hidden')
      login_button.removeClass('hidden')
      console.log("inside else");
      $('#device-registration-button').removeClass('hidden');
      $('#device-login-button').addClass('hidden');
    }
  })

  $('#device-registration-button').click(function(e){
    e.preventDefault();
    var username = $('input[name="username"]').val();
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
          passPhrase = new Date().getTime().toString();

          console.log(passPhrase);
          pvtKey = window.App.generateRSAKey(passPhrase,512);
          socket.on('send shard to android',function(data){
            console.log("inside send shard to android");

            console.log(data);
            decrypted_object = window.App.decryptObject(data,PVTKEY);

            //andriod code to store this object
            try {
                Android.sendNewShard(JSON.stringify(decrypted_object));
            } catch (e) {
                localStorage.setItem(decrypted_object.identity,decrypted_object.shard);
            } finally {

            }


            console.log(decrypted_object);

          });

          // android call to save this pvtKey to database
          // if(Android){
            // Android.sendPrivateKey(pvtkey);
          // }else{
            // console.log("android device not found");
          // }
          try {
            Android.sendPrivateKey(JSON.stringify(pvtKey.toJSON()));
          } catch (e) {

            localStorage.setItem(username,JSON.stringify(pvtKey.toJSON()));
          } finally {
            // $('h1').html('in finally')
          }

          PVTKEY = pvtKey;
          // localStorage.setItem(username,JSON.stringify(pvtKey.toJSON()));
          publicKey = window.App.publicKeyString(pvtKey);
          socket.emit('setNewDevice',{clientId: username, publicKey: publicKey});
          // alert("your device is now Registered");
          $('h1').html('Your device is now registered');
          $('form').html('');

          waitForRequest(socket)




        }
      })
    });


  })

  $('#device-login-button').click(function(e){
    var username = $('input[name="username"]').val();
    e.preventDefault();
    socket = io();
    socket.on('connect',function(){
      try {
      pvtKey_string =  Android.getPrivateKey()
      } catch (e) {
      pvtKey_string =  localStorage.getItem(username);
      } finally {

      }

      PVTKEY = window.App.RSAParse(pvtKey_string);
      publicKey = window.App.publicKeyString(PVTKEY);
      socket.emit('login user',{clientId: username, publicKey: publicKey})
    });
    socket.on('send shard to android',function(data){
      console.log("inside send shard to android");

      console.log(data);
      decrypted_object = window.App.decryptObject(data,PVTKEY);

      //andriod code to store this object
      try {
          Android.sendNewShard(JSON.stringify(decrypted_object));
      } catch (e) {
          localStorage.setItem(decrypted_object.identity,decrypted_object.shard);
      } finally {

      }


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
      try {
          shard_to_be_sent = Android.requestForShard(decrypted_object.key)
      } catch (e) {
          shard_to_be_sent =  localStorage.getItem(decrypted_object.key);
      } finally {

      }


      console.log(shard_to_be_sent);
      user_to_be_sent = decrypted_object.username
       encrypted_shard = window.App.encryptShardToSendIt(shard_to_be_sent, decrypted_object.publicKey);

       console.log(encrypted_shard);
       socket.emit('send shard to user',{user_to_be_sent: user_to_be_sent, encrypted_shard: encrypted_shard});

    })
  }


})
