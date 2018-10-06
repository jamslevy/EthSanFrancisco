const cryptico = require('cryptico');

function decryptObject(encrypted, privateKey) {
    let result = cryptico.decrypt(encrypted, privateKey);
    return JSON.parse(result.plaintext);
}

function encryptShardToSendIt(shard, publicKey) {
    let encrypted = cryptico.encrypt(JSON.stringify(shard), publicKey);
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
