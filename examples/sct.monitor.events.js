// run:
// nodejs ./examples/sct.monitor.events.js


let $sct = require('../index.js');
const fs = require("fs");

const addressFile = "./examples/smart-contract/contract.deployed.at.address.txt";
const contractAddress = fs.readFileSync(addressFile, 'utf8');

let contract = $sct.getContractInstanceFromFileAndAddress(
    "./examples/smart-contract/TestContract.sol",
    "TestContract",
    contractAddress
);

/* -- events */

$sct.allEvents(contract);
