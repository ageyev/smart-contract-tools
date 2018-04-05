// run:
// nodejs ./examples/sct.use.example.js

let $sct = require('../index.js');

/* -- truffle */
let contractDeployed = $sct.deployContractFromFile("./examples/smart-contract/TestContract.sol", "TestContract");
if (contractDeployed !== undefined) {
    console.log("[sct.use.example.js] contract deployed, contract instance address: ", contractDeployed.address);
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

/* --- truffle */
let truffleContractObj = $sct.getTruffleContractObjFromFile("./examples/smart-contract/TestContract.sol", "TestContract");

let truffleContractDeployed;
truffleContractObj.at(contractDeployed.address)
    .then(function (instance) {
            truffleContractDeployed = instance;
            // console.log(instance);
            return truffleContractDeployed.balanceOf.call($sct.web3.eth.accounts[0]);
        }
    )
    .then(function (balance) {
            // Do something with the result or continue with more transactions.
            balance = balance.toNumber();
            // console.log("balance:", balance);
            return truffleContractDeployed.transfer.sendTransaction(
                $sct.web3.eth.accounts[0],  // _to
                balance,                    // _value
                {
                    from: $sct.web3.eth.accounts[0]
                }
            )
        }
    )
    .then(function (txHash) {
            // https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgettransactionreceipt
            let txReceipt = $sct.web3.eth.getTransactionReceipt(txHash);
            console.log(txReceipt);
            // console.log(txReceipt.logs[0].topics);
            // for (let i = 0; i < txReceipt.logs[0].topics.length; i++) {
            //     console.log(txReceipt.logs[0].topics[i]);
            // }
        }
    );
