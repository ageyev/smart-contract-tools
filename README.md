# (beta) smart-contract-tools

JavaScript tools for smart contracts on the Ethereum blockchain

To be used for NodeJS apps, not for dApps as most functions are not asynchronous.

Basically, it creates web3 instance depending on eth node detected, shows basic info about the network 
and provides convenience functions.

## Usage

### Instantiate 

code: 

```js
let $sct = require('smart-contract-tools');
```

example console output:

```text
Eth Node Version:  EthereumJS TestRPC/v2.1.0/ethereum-js
Network ID: 5777  (Ganache)
Host: http://localhost:7545
Connected:  true
web3.js version: 0.20.6
Syncing:  false
Latest Block:  2
Accounts:
0x493f765e0aed2d0d66e84f465c01969db1abc76a  : 99.99999999999868 ETH
0x96c906121bcdd31273d2289f2a78241721349ca2  : 100 ETH
Default account: undefined
```
### Deploy contract

code: 

```js
let contractDeployed = $sct.deployContractFromFile("./examples/smart-contract/TestContract.sol", "TestContract");
if (contractDeployed !== undefined) {
    console.log("[sct.use.example.js] contract deployed, contractInstance.address: ", contractDeployed.address);
} else {
    console.log("[sct.use.example.js] contract was not created");
}
```

output: 

```text
contract deployed, tx hash: 0xdaaa24ea0f630bde9c267d710135b5f5d71bbc69ae864d7c6f03b038b1d1b359
deployed on block: 3
contract address:  0xb1c20f4ddd8a2a73648aa812113801380503aa51

[sct.use.example.js] contract deployed, contractInstance.address:  0xb1c20f4ddd8a2a73648aa812113801380503aa51
```

### Instantiate contract from source and an existing address

code: 

```js
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
```

output: 

```text
txSendEth: 0xb3838261d656adfef46282190af237d80bdf7554ff2e9d8c7f59072cea3c2434
txTransferTokens: 0xae75ea7fdbd12f636e8970a7cfb569260ef9d8bfbd9fc78b4ea349b757e887d0
```

## List of functions 

all function arguments are strings

**$sct.getContractObjFromString(source, contractName)**

**$sct.getContractObjFromFile(pathToFile, contractName)**

**$sct.deployContractFromString(source, contractName, from)**

**$sct.deployContractFromFile(pathToFile, contractName, from)**

**$sct.getContractInstanceFromStringAndAddress(source, contractName, address)**

**$sct.getContractInstanceFromFileAndAddress(pathToFile, contractName, address)**

