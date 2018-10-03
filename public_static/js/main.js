$(function(){
  var SAMPLE_PASSWORD = 'hello123';


  console.log("document ready");
  var submit_new_seedphrase = $('#submit-new-seedphrase');
  var input_new_seedphrase = $('#input-new-seedphrase')
  submit_new_seedphrase.click(function(e){
    e.preventDefault();
    console.log("clicked");

  })

})
