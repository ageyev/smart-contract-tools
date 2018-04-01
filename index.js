'use strict';

let $sct = {};

// https://github.com/ethereum/solc-js
// has the lates compiler version (^0.4.21)
const solc = require('solc');
const Web3 = require('web3'); // use ver. 0.20.xx as used MetaMask now
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
console.log("Network ID: ", $sct.web3.version.network, " (" + $sct.currentNetwork.networkName + ")");
console.log($sct.web3.currentProvider);
console.log("Connected: ", $sct.web3.isConnected());
console.log("syncing: ", $sct.web3.eth.syncing, ", Latest Block: ", $sct.web3.eth.blockNumber);
console.log("Accounts:");
for (let i = 0; i < $sct.web3.eth.accounts.length; i++) {
    console.log($sct.web3.eth.accounts[i], " :", $sct.web3.fromWei($sct.web3.eth.getBalance($sct.web3.eth.accounts[i])).toNumber(), "ETH");
}
console.log("-------------------------------");
//

$sct.getContractFromString = function (source) {
    // const source = contractSouceString; //
    const compiledContracts = solc.compile(source, 1);
    const compiledContract = compiledContracts.contracts[':' + 'TestContract'];
    const abi = compiledContract.interface;
    const bytecode = '0x' + compiledContract.bytecode; // (!!!) <- needs '0x' prefix
    let gasEstimate = web3.eth.estimateGas({data: bytecode});
    let MyContract = web3.eth.contract(JSON.parse(abi));
    MyContract.gasEstimateForDeployment = gasEstimate;
    return MyContract;
};

$sct.getContractFromFile = function (pathToFile) {
    const source = fs.readFileSync(pathToFile, 'utf8');
    $sct.getContractFromString(source);
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


/**
 * Adds commas to a number
 * @param {number} number
 * @param {string} locale
 * @return {string}
 */
// module.exports = function(number, locale) {
//     return number.toLocaleString(locale);
// };

module.exports = $sct;
