#!/usr/bin/env bash

#git add .
#git commit -a -m "Initial release"
#git tag v0.1.0
#git push origin master --tags

git add .
git commit -a -m "add deploy functions"
git tag v0.2.0
git push origin master --tags

npm whoami
npm publish

google-chrome --incognito https://npmjs.com/package/smart-contract-tools
