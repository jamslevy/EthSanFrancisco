const bip39 = require('bip39');
const crypto = require('crypto');
const sssa = require('sssa-js');
const cryptico = require('cryptico');
const CryptoJS = require('crypto-js');
const SHARE_COUNT = 3;
const THRESHOLD = 2;

// Sending Functions
console.log("inside bundle js");
function mnemonicToSSS(mnemonic, password, callback) {
    let key = bip39.mnemonicToEntropy(mnemonic);
    return new Promise(function(resolve, reject) {
        let encKey = CryptoJS.AES.encrypt(key, password).toString();
        let shares = sssa.create(THRESHOLD, SHARE_COUNT, encKey);
        resolve(shares);
        if(callback) callback(shares);
    });
}

function createKey(usernameOfHolder, usernameOfSaver, password) {
    let combinedUsername = usernameOfHolder + password + usernameOfSaver;
    let encKey = crypto.createHash('sha256').update(combinedUsername).digest('base64');
    console.log(encKey);
    return encKey;
}

function encryptKeyValuePairUsingPublicKey(key, value, publicKey) {
    let objectToBeEncrypted = {
        identity : key,
        shard : value
    };

    let buffer = JSON.stringify(objectToBeEncrypted);
    let encrypted = cryptico.encrypt(buffer, publicKey);
    return encrypted.cipher;
}

function returnArraysOfDataToBeSent(arrayOfReceivers, mnemonic, password, username) {
    console.log("array of Receo", arrayOfReceivers);
    return new Promise(function (resolve, reject) {
        function afterLoop(array) {
            resolve(array);
        }
        if(arrayOfReceivers.length !== SHARE_COUNT){
            reject("Invalid Number of Receivers");
        }else{
            mnemonicToSSS(mnemonic, password)
                .then(function (shares) {
                    let arrayToBeReturned = [];
                    for(let i = 0; i < SHARE_COUNT; i++){
                        let receiverPublicKey = arrayOfReceivers[i].publicKey;
                        let receiverUsername = arrayOfReceivers[i].username;
                        // let receiverLink = arrayOfReceivers.link;
                        let key = createKey(username, receiverUsername, password);
                        let data = encryptKeyValuePairUsingPublicKey(key, shares[i], receiverPublicKey);
                        let retVal = {
                            data : data,
                            username : receiverUsername
                        };
                        arrayToBeReturned.push(retVal);
                        if(i === SHARE_COUNT - 1){
                            afterLoop(arrayToBeReturned);
                        }
                    }
                });
        }
    });
}
// Sending Function End

//Requesting for Keys
function encryptDataToBeSentForRequest(key, senderPublicKey, receiverPublicKey, senderUsername) {
    let objectToBeEncrypted = {
        key : key,
        publicKey : senderPublicKey,
        username : senderUsername
    };
    let buffer = JSON.stringify(objectToBeEncrypted);
    let encrypted = cryptico.encrypt(buffer, receiverPublicKey);
    return encrypted.cipher;
}

function requestKeys(arrayOfReceivers, senderPublicKey, password, username){
    return new Promise(function (resolve, reject) {
        function afterLoop(array) {
            resolve(array);
        }

        if(arrayOfReceivers.length !== SHARE_COUNT){
            reject("Invalid Number of Receivers");
        }else{
            let arrayToBeReturned = [];
            for(let i = 0; i < SHARE_COUNT; i++){
                // console.log(arrayOfReceivers[i]);
                let receiverPublicKey = arrayOfReceivers[i].publicKey;
                let receiverUsername = arrayOfReceivers[i].username;
                // let receiverLink = arrayOfReceivers.link;
                let key = createKey(username, receiverUsername, password);
                let data = encryptDataToBeSentForRequest(key, senderPublicKey, receiverPublicKey, username);
                let retVal = {
                    data : data,
                    username : receiverUsername
                };
                arrayToBeReturned.push(retVal);
                if(i === SHARE_COUNT - 1){
                    afterLoop(arrayToBeReturned);
                }
            }
        }
    });
}
//Requesting for Keys End

//Combining Keys
function combinePieces(mnemonicShares, password) {
    let shares = mnemonicShares;
    let splitVal = sssa.combine(shares);
    let encKey = splitVal;
    return new Promise((resolve, reject) => {
        let bytes  = CryptoJS.AES.decrypt(encKey, password);
        let plaintext = bytes.toString(CryptoJS.enc.Utf8);
        resolve(bip39.entropyToMnemonic(plaintext));
    });
}

function decryptPieceUsingPrivateKey(encrypted, privateKey) {
    let result = cryptico.decrypt(encrypted, privateKey);
    console.log(result);
    return result.plaintext;
}

function arrayOfKeysReceived(arrayOfPieces, privateKey, password){
    return new Promise(function (resolve, reject) {
        console.log("PK", privateKey);
        if(arrayOfPieces.length !== THRESHOLD){
            reject("Invalid Length of Array");
        } else {
            function todoAfterLoop(array, users) {
              console.log(users, "inside todo after loop");
                combinePieces(array, password)
                    .then(function (mnemonic) {
                      console.log(users , "inside combinePieces then");
                        resolve({
                          mnemonic : mnemonic,
                          users : users
                        });
                    })
            }
            let arrayToBePassed = [];
            let userArray = [];
            for(let i = 0; i < THRESHOLD; i++){
                let currPiece = arrayOfPieces[i];
                let shard1 = decryptPieceUsingPrivateKey(currPiece, privateKey);
                window.App.shard1 = shard1
                shard = JSON.parse(shard1.toString())
                console.log(shard);
                user = shard["userSending"];
                console.log("inside array to be passed");
                console.log(user);
                shard = shard["shard"];
                userArray.push(user);
                console.log(userArray, "User Array");
                arrayToBePassed.push(shard);
                if(i === THRESHOLD - 1){
                    todoAfterLoop(arrayToBePassed, userArray);
                }
            }
        }
    });
}
//Combining Keys End

// function getRandomIDs(password , number_of_users , time_stamp) {
//     let sha1_encryption = crypto.createHash('sha1').update(password).digest("hex");
//
//     let sub_string_length = sha1_encryption.length / 5 ;
//
//     let substring_array = sha1_encryption.match(new RegExp('.{1,' + sub_string_length + '}', 'g'));
//
//     let number_arr = [] ;
//
//     for (var i = 0; i < substring_array.length; i++) {
//         let str = "" ;
//
//         for(var j = 0 ; j < substring_array[i].length ; j++)
//         {
//             str = str + substring_array[i].charCodeAt(j) ;
//         }
//
//         number_arr.push(str) ;
//
//     }
//
//
//     let num_arr = [] ;
//
//     for (var i = 0; i < number_arr.length; i++) {
//         num_arr.push(Number(number_arr[i]) % number_of_users);
//     }
//
//
//     for (var i = 0; i < num_arr.length; i++) {
//         num_arr[i] =  ( num_arr[i] * Math.log(time_stamp) ) % number_of_users ;
//     }
//
//
//
//     var map = new Map();
//
//     for (var i = 0; i < num_arr.length; i++) {
//         if( map.has(num_arr[i]) == true )
//         {
//             let temp = num_arr[i] ;
//
//             let count  = 1 ;
//             while(map.has(temp) == true)
//             {
//                 temp = temp + Math.pow(count , 2) ;
//                 temp = temp % number_of_users ;
//                 count = count + 1 ;
//             }
//
//             num_arr[i] = temp ;
//
//             map.set(num_arr[i] , " ") ;
//
//
//
//
//         }
//         else
//         {
//             map.set(num_arr[i] , " ") ;
//         }
//     }
//
//
//   for (var i = 0; i < num_arr.length; i++) {
//     num_arr[i] = Math.floor(num_arr[i]) ;
//   }
//
//
//
//     return num_arr ;
//
//
//
//
//
//
// }

function generateKeys(){
    let RSAKey = cryptico.generateRSAKey(new Date().getTime(), 512);
    let publicKey = cryptico.publicKeyString(RSAKey);
    return {
        privateKey : RSAKey,
        publicKey : publicKey
    }
}

window.App = {
    Send : returnArraysOfDataToBeSent,
    Request : requestKeys,
    Combine : arrayOfKeysReceived,
    Generate : generateKeys
  };
