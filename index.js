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

//Requesting for Keys

function encryptDataToBeSentForRequest(key, senderPublicKey, receiverPublicKey) {
    let objectToBeEncrypted = {
        key : key,
        publicKey : senderPublicKey
    };
    let buffer = JSON.stringify(objectToBeEncrypted);
    let encrypted = cryptico.encrypt(receiverPublicKey, buffer);
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
                let receiverPublicKey = arrayOfReceivers.publicKey;
                let receiverUsername = arrayOfReceivers.username;
                let receiverLink = arrayOfReceivers.link;
                let key = createKey(username, receiverUsername, password);
                let data = encryptDataToBeSentForRequest(key, senderPublicKey, receiverPublicKey);
                let retVal = {
                    data : data,
                    link : receiverLink
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
        var d = crypto.createDecipher("aes128", password);
        var rawKey = d.update(encKey, "hex", "hex");
        rawKey += d.final("hex");
        resolve(bip39.entropyToMnemonic(rawKey));
    });
}

function decryptPieceUsingPrivateKey(encrypted, privateKey) {
    let result = cryptico.decrypt(encrypted, privateKey);
    return result.plaintext;
}

function arrayOfKeysReceived(arrayOfPieces, privateKey, password){
    return new Promise(function (resolve, reject) {
        if(arrayOfPieces.length !== THRESHOLD){
            reject("Invalid Length of Array");
        } else {
            function todoAfterLoop(array) {
                combinePieces(array, password)
                    .then(function (mnemonic) {
                        resolve(mnemonic);
                    })
            }
            let arrayToBePassed = [];
            for(let i = 0; i < THRESHOLD; i++){
                let currPiece = arrayOfPieces[i];
                let shard = decryptPieceUsingPrivateKey(currPiece, privateKey);
                arrayToBePassed.push(shard);
                if(i === THRESHOLD - 1){
                    todoAfterLoop(arrayToBePassed);
                }
            }
        }
    });
}

//Combining Keys End

window.App = {
    Send : returnArraysOfDataToBeSent,
    Request : requestKeys,
    Combine : arrayOfKeysReceived
};