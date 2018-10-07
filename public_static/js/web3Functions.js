

const abi = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "username",
                "type": "string"
            }
        ],
        "name": "splitKey",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_address",
                "type": "address"
            }
        ],
        "name": "setContractAddress",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_user1",
                "type": "string"
            },
            {
                "name": "_user2",
                "type": "string"
            },
            {
                "name": "_selfUsername",
                "type": "string"
            }
        ],
        "name": "privateKeyRegenerated",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_username",
                "type": "string"
            }
        ],
        "name": "addAndroidUser",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "LogSomething",
        "type": "event"
    }
];
const contractAddress = '0xae27d33d7a797C8fD777f07c4B97292aE24De75E';
let self = web3.eth.accounts[0];
let SMUContract = web3.eth.contract(abi);
let contract = SMUContract.at(contractAddress);

function addAndroidUser(username) {
    contract.addAndroidUser(username, {
        from: self
    }, function (err, result) {
        if(err) throw err;
        console.log("result", result);
    });
}

function splitKey(username) {
    contract.splitKey(username, {
        from: self,
        gas: 500000,
        gasPrice: web3.toWei(40,'gwei')
    }, function (err, result) {
        if(err) throw err;
        console.log("result", result);
    })
}

function privateKeyRegenerated(user1, user2, self_user) {
    contract.privateKeyRegenerated(user1, user2, self_user, {
        from: self,
        gas: 500000,
        gasPrice: web3.toWei(40,'gwei')
    }, function (err, result) {
        if(err) throw err;
        console.log("result", result);
    })
}

