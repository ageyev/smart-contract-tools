'use strict';

/*
* Utility functions for smart contracts.
* For NodeJS apps, not for dApps as most functions are not asynchronous.
* Basically, it creates web3 instance depending on eth node detected, shows basic info about the network
* and provides convenience functions.
*
* */

let $sct = {};

// https://github.com/ethereum/solc-js
// has the lates compiler version (^0.4.21)
const solc = require('solc');
const Web3 = require('web3'); // use ver. 0.20.xx as used MetaMask now
const truffleContract = require("truffle-contract");
const fs = require("fs");

/* web3 instantiation */
// to access web3 instance in browser console:
// angular.element('body').scope().$root.web3
// see 'NOTE FOR DAPP DEVELOPERS' on https://github.com/ethereum/mist/releases/tag/v0.9.0
try {
    if (typeof web3 !== 'undefined') {
        console.log('web3 object presented by provider:', web3.currentProvider);
        $sct.web3 = new Web3(web3.currentProvider);
    } else {
        $sct.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        if (!$sct.web3.isConnected()) {
            $sct.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
            if (!$sct.web3.isConnected()) {
                console.log("[error] no connection to node");
                $sct.web3 = null;
                $sct.noConnectionToNodeError = true;
            }
        }
    }
} catch (error) {
    console.log(error);
    $sct.noConnectionToNodeError = true;
}

/* === web3.js === */
// example from:
// https://github.com/trufflesuite/truffle-artifactor#artifactorgenerateoptions-networks
$sct.networks = {
    "1": {
        "networkName": "Main Ethereum Network",
        "etherscanLinkPrefix": "https://etherscan.io/",
        "etherscanApiLink": "https://api.etherscan.io/"
    },
    "2": {
        "networkName": "Morden TestNet",
        "etherscanLinkPrefix": undefined,
        "etherscanApiLink": undefined
    },
    "3": {
        "networkName": "Ropsten TestNet",
        "etherscanLinkPrefix": "https://ropsten.etherscan.io/",
        "etherscanApiLink": "https://api-ropsten.etherscan.io/"
    },
    "4": {        //
        "networkName": "Rinkeby TestNet",
        "etherscanLinkPrefix": "https://rinkeby.etherscan.io/",
        "etherscanApiLink": "https://api-rinkeby.etherscan.io/"
    },
    "5777": {
        "networkName": "Ganache",
        "etherscanLinkPrefix": "https://etherscan.io/",
        "etherscanApiLink": "https://api.etherscan.io/"
    }
};

$sct.currentNetwork = {};

if (!$sct.noConnectionToNodeError) {

    $sct.currentNetwork.connected = true;
    let networkId = $sct.web3.version.network; // "3" for Ropsten, "1" for MainNet etc.

    if (networkId === "1" || networkId === "2" || networkId === "3" || networkId === "4" || networkId === "5777") {
        $sct.currentNetwork.networkName = $sct.networks[networkId].networkName;
        $sct.currentNetwork.etherscanLinkPrefix = $sct.networks[networkId].etherscanLinkPrefix;
        $sct.currentNetwork.etherscanApiLink = $sct.networks[networkId].etherscanApiLink;

    } else {
        $sct.currentNetwork.networkName = "unknown network";
        $sct.currentNetwork.etherscanLinkPrefix = $sct.networks["1"].etherscanLinkPrefix;
        $sct.currentNetwork.etherscanApiLink = $sct.networks["1"].etherscanApiLink;
    }

} // end of if (!$sct.noConnectionToNodeError)

// data:
console.log("-------------------------------");
console.log("Eth Node Version: ", $sct.web3.version.node);
console.log("Network ID:", $sct.web3.version.network, " (" + $sct.currentNetwork.networkName + ")");
console.log("Host:", $sct.web3.currentProvider.host); //
console.log("Connected: ", $sct.web3.isConnected());
console.log("web3.js version:", $sct.web3.version.api);
console.log("Syncing: ", $sct.web3.eth.syncing);
console.log("Latest Block: ", $sct.web3.eth.blockNumber);
console.log("Accounts:");
for (let i = 0; i < $sct.web3.eth.accounts.length; i++) {
    console.log($sct.web3.eth.accounts[i], " :", $sct.web3.fromWei($sct.web3.eth.getBalance($sct.web3.eth.accounts[i])).toNumber(), "ETH");
}
console.log("Default account:", $sct.web3.eth.defaultAccount);
console.log("-------------------------------");
//

$sct.getSolcJsCompiledSourceFromString = function (source, contractName) {
    let compiledContracts;
    try {
        compiledContracts = solc.compile(source, 1); // setting 1 as second parameter activates the optimiser
    } catch (error) {
        console.log(error);
        return;
    }
    if (compiledContracts.errors) {
        console.log("compiler error:");
        console.log(compiledContracts.errors);
        return;
    }
    let contractNames = Object.keys(compiledContracts.contracts);
    const compiledContract = compiledContracts.contracts[':' + contractName];
    if (compiledContract === undefined) {
        console.log('provided source code does not contain contract named: ', contractName, "(" + contractNames + ")");
    }
    return compiledContract; // or undefined
};

$sct.getSolcJsCompiledSourceFromFile = function (pathToFile, contractName) {
    const source = fs.readFileSync(pathToFile, 'utf8');
    return $sct.getSolcJsCompiledSourceFromString(source, contractName);
};

$sct.getContractObjFromString = function (source, contractName) {
    const compiledContract = $sct.getSolcJsCompiledSourceFromString(source, contractName);
    if (compiledContract === undefined) {
        return undefined;
    }
    const abi = compiledContract.interface;
    return $sct.web3.eth.contract(JSON.parse(abi));
};

$sct.getContractObjFromFile = function (pathToFile, contractName) {
    const source = fs.readFileSync(pathToFile, 'utf8');
    $sct.getContractObjFromString(source, contractName);
};


$sct.deployContractFromString = function (source, contractName, from) {

    let compiledContracts;
    try {
        compiledContracts = solc.compile(source, 1); // setting 1 as second parameter activates the optimiser
    } catch (error) {
        console.log(error);
        return;
    }
    if (compiledContracts.errors) {
        console.log("compiler error:");
        console.log(compiledContracts.errors);
        return;
    }
    let contractNames = Object.keys(compiledContracts.contracts);
    const compiledContract = compiledContracts.contracts[':' + contractName];
    if (compiledContract === undefined) {
        console.log('provided source code does not contain contract named: ', contractName, "(" + contractNames + ")");
    }
    const abi = compiledContract.interface;
    let contractObject = $sct.web3.eth.contract(JSON.parse(abi));
    //--
    const bytecode = '0x' + compiledContract.bytecode; // (!!!) <- needs '0x' prefix
    let gasEstimate = $sct.web3.eth.estimateGas({data: bytecode});

    if (from === undefined) {
        if ($sct.web3.eth.defaultAccount) {
            from = $sct.web3.eth.defaultAccount;
        } else if ($sct.web3.eth.accounts[0]) {
            from = $sct.web3.eth.accounts[0];
        } else {
            console.log("ethereum address required");
            return;
        }
    }

    // https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethcontract
    let contractInstance = contractObject.new({
            from: from,
            data: bytecode, // <<< needs "0x" prefix
            gas: gasEstimate
        }
    );
    // the hash of the transaction, which created the contract
    console.log("contract deployed, tx hash:", contractInstance.transactionHash);

    // https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgettransaction
    // blockNumber: Number - block number where this transaction was in. null when its pending.
    while ($sct.web3.eth.getTransaction(contractInstance.transactionHash).blockNumber === null) {
        // ...
    }
    // console.log($sct.web3.eth.getTransaction(contractInstance.transactionHash));
    console.log("deployed on block:", $sct.web3.eth.getTransaction(contractInstance.transactionHash).blockNumber);

    // contractInstance.address undefined at start, but will be auto-filled later) < doesn't work
    // console.log("contractInstance.address:", contractInstance.address);

    // https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgettransactionreceipt
    let transactionReceipt = $sct.web3.eth.getTransactionReceipt(contractInstance.transactionHash);
    // console.log(transactionReceipt); //

    // https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgettransactionreceipt
    // status: Number - 0 indicates transaction failure , 1 indicates transaction succeeded
    // --- in fact:
    // console.log("typeof transactionReceipt.status:", typeof transactionReceipt.status); // string
    // console.log("transactionReceipt.status:", transactionReceipt.status); //
    // success: '0x1' (Geth) or '0x01' (Ganache)
    if (transactionReceipt.status === '0x00' // Ganache
        || transactionReceipt.status === '0x0') { // Geth
        console.log("contract creation transaction failed");
        return;
    }

    // https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgettransactionreceipt
    // contractAddress: String - 20 Bytes - The contract address created, if the transaction was a contract creation,
    // otherwise null.
    if (transactionReceipt.contractAddress === null) {
        console.log("contract was not created by the transaction");
        return;
    }
    console.log("contract address: ", transactionReceipt.contractAddress);
    console.log(); // empty line
    contractInstance.address = transactionReceipt.contractAddress;

    return contractInstance;

};

$sct.deployContractFromFile = function (pathToFile, contractName, from) {
    const source = fs.readFileSync(pathToFile, 'utf8');
    return $sct.deployContractFromString(source, contractName, from);
};

$sct.getContractInstanceFromStringAndAddress = function (source, contractName, address) {
    return $sct.getContractObjFromString(source, contractName).at(address);
};

$sct.getContractInstanceFromFileAndAddress = function (pathToFile, contractName, address) {
    const source = fs.readFileSync(pathToFile, 'utf8');
    return $sct.getContractInstanceFromStringAndAddress(source, contractName, address);
};

$sct.allEvents = function (contractInstance) {
    // <<<< events:
    console.log("---------------------------");
    console.log("listening to events");
    let eventsCounter = 0;
    contractInstance.allEvents(function (error, result) {
            if (!error) {
                console.log('event # ', eventsCounter++, ': --------------------');
                console.log("event: ", result.event); // event name
                console.log(result); // all data
                // if (result.event === 'Transfer') {
                //     console.log('Transfer:');
                //     console.log("from: ", result.args.from);
                //     console.log("to: ", result.args.from);
                //     console.log("value: ", result.args.value.toNumber());
                // } else {
                //     console.log(result);
                // }
                console.log(); // empty line
            } else {
                console.log(error);
            }
        }
    );
};

/* -- truffle */

$sct.getTruffleContractObjFromString = function (source, contractName) {
    let solcCompiledContract = $sct.getSolcJsCompiledSourceFromString(source, contractName);
    let truffleContractObj = truffleContract(
        {
            abi: solcCompiledContract.interface,
            unlinked_binary: '0x' + solcCompiledContract.bytecode,
        }
    );
    truffleContractObj.setProvider($sct.web3.currentProvider);
    return truffleContractObj;
};

$sct.getTruffleContractObjFromFile = function (pathToFile, contractName) {
    const source = fs.readFileSync(pathToFile, 'utf8');
    return $sct.getTruffleContractObjFromString(source, contractName);
};

module.exports = $sct;
