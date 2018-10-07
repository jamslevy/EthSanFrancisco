$(function(){
    let privateKey;
    var SAMPLE_PASSWORD = 'hello123';
    var SAMPLE_USERNAME = 'username';
    $('button').first().click(function(){
      $('#info-box').addClass('hidden');

      if($('#registration-form').hasClass('hidden')){
          $('#registration-form').removeClass('hidden');
          if(!$('#login-form').hasClass('hidden')){
            $('#login-form').addClass('hidden')
          }
      }

    })
    $('button').last().click(function(){

      $('#info-box').addClass('hidden');


      if($('#login-form').hasClass('hidden')){
          $('#login-form').removeClass('hidden');
          if(!$('#registration-form').hasClass('hidden')){
            $('#registration-form').addClass('hidden')
          }
      }

    })
    function selectUsersFromPassword(password, count) {
        return new Promise(function (resolve, reject) {
            resolve([0, 1, 2]);
        });
    };
    $('input[name=login]').click(function(e){

      e.preventDefault();
      console.log("click");
      SAMPLE_PASSWORD = $('#login-form input[name=password]').val();
      console.log(SAMPLE_PASSWORD);
      SAMPLE_USERNAME = $('#login-form input[name=username]').val();
      console.log(SAMPLE_USERNAME);
      const socket = io('http://10.7.12.105:3000');
      const keyPair = window.App.Generate();
      privateKey = keyPair.privateKey;
      const publicKey = keyPair.publicKey;
      socket.on('connect', function () {
          socket.emit('get user count');
          socket.on('user count', function (count) {
              selectUsersFromPassword(SAMPLE_PASSWORD, count)
                  .then(function (arrayWithIndices) {
                      function afterLoop(array){
                          // console.log(array);
                          window.App.Request(array, publicKey, SAMPLE_PASSWORD, SAMPLE_USERNAME)
                              .then(function (arrayReturn) {
                                  // console.log(arrayReturn);
                                  socket.emit('login user', {
                                     clientId : SAMPLE_USERNAME,
                                     publicKey : publicKey
                                  });
                                  console.log("publicKey" , publicKey);
                                  socket.emit('request shards', arrayReturn);
                                  console.log("after emitting request shards");
                                  receivingShards();
                              })
                      }
                      let arrayOfData = [];
                      let i = 0;
                      requestForData(arrayWithIndices[i]);
                      socket.on('user data', function (data) {
                          // console.log("Data : ", data);
                          arrayOfData.push(data);
                          i++;
                          if(i < arrayWithIndices.length){
                              requestForData(arrayWithIndices[i]);
                          }else{
                              afterLoop(arrayOfData);
                          }
                      })
                  });
          });
          function requestForData(index) {
              socket.emit('get user data', index);
          }
      });
      let shardsArray = [];
      let already = false;
      function receivingShards() {
        console.log("inside recievingShards");
          socket.on('send encrypted shard to user', function (encryptedShard) {
            console.log("inside encrypted shard to user");
              if(shardsArray.length < 2){
                  shardsArray.push(encryptedShard);
                  console.log(shardsArray);
              }
              if(shardsArray.length === 2 && !already){
                  already = true;
                  let x = window.App.Combine(shardsArray, privateKey, SAMPLE_PASSWORD)
                    .then(function(obj) {
                      console.log(obj.mnemonic);
                      console.log(obj.users);
                        $('#seedphrase').html(seedphrase);
                        $('#releaseFunds').click(function (e) {
                          e.preventDefault();
                          privateKeyRegenerated(users[0], users[1], SAMPLE_USERNAME);
                        })
                    });
              }
          });
      }
    })


    $('input[name=register]').click(function(e){
      e.preventDefault();
      console.log("me clicked");
      SAMPLE_PASSWORD = $('#registration-form input[name=password]').val();
      SAMPLE_USERNAME = $('#registration-form input[name=username]').val();

      var input_new_seedphrase = $('#seedphrase').val();
      console.log(input_new_seedphrase);
      splitKey(SAMPLE_USERNAME, function(){
        const socket = io();
        socket.on('connect', function () {
            console.log("Connected for Splitting IO");
            socket.emit('get user count');
            socket.on('user count', function (count) {
                selectUsersFromPassword(SAMPLE_PASSWORD, count)
                    .then(function (arrayWithIndices) {
                        // console.log("array of indices", arrayWithIndices);
                        function afterLoop(array){
                            window.App.Send(array, input_new_seedphrase, SAMPLE_PASSWORD, SAMPLE_USERNAME)
                                .then(function (arrayReturn) {
                                    console.log(arrayReturn);
                                    socket.emit('send shards', arrayReturn);
                                });
                        }
                        let arrayOfData = [];
                        let i = 0;
                        requestForData(arrayWithIndices[i]);
                        socket.on('user data', function (data) {
                            // console.log("Data : ", data);
                            arrayOfData.push(data);
                            i++;
                            if(i < arrayWithIndices.length){
                                requestForData(arrayWithIndices[i]);
                            }else{
                                afterLoop(arrayOfData);
                            }
                        })
                    });
            });
            function requestForData(index) {
                socket.emit('get user data', index);
            }
        });
      })

    })


    console.log("document ready");
    var submit_new_seedphrase = $('#submit-new-seedphrase');
    var get_seedphrase = $('#get-seedphrase');
    // console.log(input_new_seedphrase);

    // Send Seed Phrase

    // End Send Seed Phrase

    // Receive Seed Phrase

    //End Receive Seed Phrase
});
