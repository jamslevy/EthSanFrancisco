const mongodb = require('mongodb').MongoClient;
const pkHolderCollection = "webusers";
const androidCollection = "androidusers";
const url = "mongodb://localhost:27017";
const DbName = "SplitMeUp";

module.exports = {

    connect : function () {
        let self = this;
        return new Promise(function (resolve, reject) {
            mongodb.connect(url, function (err, database) {
                if(err) reject(err);
                else {
                    self.obj = database.db(DbName);
                    self.obj.collection(androidCollection).connect(function (err, count) {
                        if(err) throw err;
                        if(count >= 1){
                            self.currentIndex = count - 1;
                            resolve(true);
                        }
                    });
                }
            });
        });
    },

    addAndroidUser : function (username, password, publicKey) {
        let self = this;
        return new Promise(function (resolve, reject) {
            let objtoadd = {
                username : username,
                password : password,
                publicKey : publicKey,
                index : self.currentIndex + 1
            };
            self.obj.collection(androidCollection).insertOne(objtoadd, function (err, result) {
                if(err) reject(err);
                else{
                    self.currentIndex = self.currentIndex + 1;
                    resolve(true);
                }
            })
        });
    },

    checkAndroidUser : function (username) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.obj.collection(androidCollection).findOne({
                username: username
            }, function (err, result) {
                if(err) reject(err);
                else{
                    if(result == null){
                        resolve(false);
                    }else{
                        resolve(true);
                    }

                }
            });
        });
    },

    getNumberOfAndroidUsers : function () {
        return this.currentIndex + 1;
    },

    getAndroidUserDetailsForEncryption : function (index) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.obj.collection(androidCollection).findOne({
                index : index
            }, function (err, result) {
                if(err) reject(err);
                else{
                    let retVal = {
                        username : result.username,
                        publicKey : result.publicKey
                    };
                    resolve(retVal);
                }
            })
        });
    },

    addPrivateKeyUser : function (username, noOfUsers) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.obj.collection(pkHolderCollection).insertOne({
                username : username,
                number : noOfUsers
            }, function (err, result) {
                if(err) throw err;
                resolve(result);
            });
        });
    },

    getPrivateKeyUserDetail : function (username) {
        let self = this;
        return new Promise(function (resolve, reject) {
           self.obj.collection(pkHolderCollection).findOne({
               username : username
           }, function (err, result) {
               if(err) throw err;
               resolve(result);
           })
        });
    }
};

module.exports.connect().then(function () {
    console.log("connected");
    module.exports.checkAndroidUser('abc');
});