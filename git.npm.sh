#!/usr/bin/env bash

#git add .
#git commit -a -m "Initial release"
#git tag v0.1.0
#git push origin master --tags

# (!) change version in package.json
git add .
git commit -a -m "change: if web3.eth.defaultAccount not set, will be set to web3.eth.coinbase; change package version"
git tag v0.3.3 # as in package.json
git push origin master --tags
git push --all

npm whoami
npm publish

google-chrome --incognito https://npmjs.com/package/smart-contract-tools
