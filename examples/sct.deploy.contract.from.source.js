// run:
// nodejs ./examples/sct.deploy.contract.from.source.js

let $sct = require('../index.js');
const fs = require("fs");

const addressFile = "./examples/smart-contract/contract.deployed.at.address.txt";
if (fs.existsSync(addressFile)) {
    fs.unlinkSync(addressFile);
}

let contractDeployed = $sct.deployContractFromFile("./examples/smart-contract/TestContract.sol", "TestContract");

if (contractDeployed !== undefined) {
    console.log("contract deployed, contract instance address: ", contractDeployed.address);
    fs.writeFileSync(addressFile, contractDeployed.address);

} else {
    console.log("ERROR: contract was not created");
}