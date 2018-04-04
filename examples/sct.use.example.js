// run:
// nodejs ./examples/sct.use.example.js

let $sct = require('../index.js');

let contractDeployed = $sct.deployContractFromFile("./examples/smart-contract/TestContract.sol", "TestContract");
if (contractDeployed !== undefined) {
    console.log("[sct.use.example.js] contract deployed, contractInstance.address: ", contractDeployed.address);
} else {
    console.log("[sct.use.example.js] contract was not created");
}

let contract = $sct.getContractInstanceFromFileAndAddress(
    "./examples/smart-contract/TestContract.sol",
    "TestContract",
    contractDeployed.address
);

let txSendEth = $sct.web3.eth.sendTransaction({
    from: $sct.web3.eth.accounts[0],
    to: contract.address,
    value: contract.tokenPriceInWei.call().toNumber()
});
console.log("txSendEth:", txSendEth);

let txTransferTokens = contract.transfer.sendTransaction(
    $sct.web3.eth.accounts[0],
    contract.balanceOf.call($sct.web3.eth.accounts[0]),
    {from: $sct.web3.eth.accounts[0]}
);
console.log("txTransferTokens:", txTransferTokens);

