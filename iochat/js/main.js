$(function(){
console.log('document ready');


$('#show-form-button').click(function(){

  $(this).css('display','none');
  $('#registration-form').removeClass('hidden')
})

$('#device-registration-button').click(function(e){
  e.preventDefault();
  console.log("here ");
  //verify from mongo if username is unique
    //if unique ,
      //then save to db

    //else warn user to choose new username

})

})
