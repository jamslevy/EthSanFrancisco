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
    socket = io();
    socket.on('connect',function(){
      console.log("connect callaed from front end");
      console.log(username);
      socket.emit('setNewDevice',{clientId: username});
    })

  })

})
