#!/usr/bin/env bash

git add .
git commit -a -m "Initial release"
git tag v0.1.0
git push origin master --tags