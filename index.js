const bip39 = require('bip39');
const crypto = require('crypto');
const sssa = require('sssa-js');
const cryptico = require('cryptico');
const SHARE_COUNT = 5;
const THRESHOLD = 2;

// Sending Functions
function mnemonicToSSS(mnemonic, password, callback) {
    console.log("inside menmonicToSSS");
    let key = bip39.mnemonicToEntropy(mnemonic);
    console.log("pkey", key);
    return new Promise(function(resolve, reject) {
        let c = crypto.createCipher("aes128", password);
        let encKey = c.update(key, 'hex', 'hex');
        encKey += c.final('hex');
        // console.log("enckey inside menmonicToSSS", encKey);
        let shares = sssa.create(THRESHOLD, SHARE_COUNT, encKey);
        resolve(shares);
        if(callback) callback(shares);
    });
}

function createKey(usernameOfHolder, usernameOfSaver, password) {
    let combinedUsername = usernameOfHolder + usernameOfSaver;
    let c = crypto.createCipher("aes128", password);
    let key = c.update(combinedUsername, 'hex', 'hex');
    key += c.final('hex');
    return key;
}

function encryptKeyValuePairUsingPublicKey(key, value, publicKey) {
    let objectToBeEncrypted = {
        key : value
    };
    let buffer = JSON.stringify(objectToBeEncrypted);
    let encrypted = cryptico.encrypt(publicKey, buffer);
    return encrypted.cipher;
}

function returnArraysOfDataToBeSent(arrayOfReceivers, mnemonic, password, username) {
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
                        let receiverPublicKey = arrayOfReceivers.publicKey;
                        let receiverUsername = arrayOfReceivers.username;
                        let receiverLink = arrayOfReceivers.link;
                        let key = createKey(username, receiverUsername, password);
                        let data = encryptKeyValuePairUsingPublicKey(key, shares[i], receiverPublicKey);
                        let retVal = {
                            data : data,
                            link : receiverLink
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

window.App = {
    Send : returnArraysOfDataToBeSent
};