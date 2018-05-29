// run:
// nodejs ./examples/sct.emit.events.js


let $sct = require('../index.js');
const fs = require("fs");

const addressFile = "./examples/smart-contract/contract.deployed.at.address.txt";
const contractAddress = fs.readFileSync(addressFile, 'utf8'); // If the encoding option is specified then this function returns a string. Otherwise it returns a buffer.

let contract = $sct.getContractInstanceFromFileAndAddress(
    "./examples/smart-contract/TestContract.sol",
    "TestContract",
    contractAddress
);
// console.log("contract address:", contract.address);

let intervalInMilliseconds = 1000 * 7; //
let counter = 0;
let intervalFunc = function () {

    console.log(counter++);

    /* --- send ether */
    let txSendEth = $sct.web3.eth.sendTransaction({
        from: $sct.web3.eth.accounts[0],
        to: contract.address,
        value: contract.tokenPriceInWei.call().toNumber()
    });
    // console.log($sct.web3.eth.getTransactionReceipt(txSendEth));
    console.log("send eth to contract tx:", txSendEth);

    console.log("------------------------------------");

    /* --- transfer tokens*/
    let txTransferTokens = contract.transfer.sendTransaction(
        $sct.web3.eth.accounts[0],
        contract.balanceOf.call($sct.web3.eth.accounts[0]),
        {from: $sct.web3.eth.accounts[0]}
    );
    // console.log($sct.web3.eth.getTransactionReceipt(txTransferTokens));
    console.log("transfer tokens tx:", txTransferTokens);

    console.log("====================================");

};

setInterval(
    intervalFunc,
    intervalInMilliseconds
);
