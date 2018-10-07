const cryptico = require('cryptico');

function decryptObject(encrypted, privateKey) {
    let result = cryptico.decrypt(encrypted, privateKey);
    console.log(result);
    return JSON.parse(result.plaintext);
}

function encryptShardToSendIt(shard, publicKey) {
  console.log("inside encryptShardToSendIt");
    shard = JSON.stringify(shard)
    console.log(shard);
    let encrypted = cryptico.encrypt(shard, publicKey);

    console.log(encrypted);
    return encrypted.cipher;
}
generateRSAKey = cryptico.generateRSAKey;
publicKeyString = cryptico.publicKeyString;

RSAParse = cryptico.RSAKey.parse;

window.App = {
  decryptObject,
  encryptShardToSendIt,
  generateRSAKey,
  publicKeyString,
  RSAParse


};
