#! /bin/bash

git reset --hard origin/master
git clean -f
git pull origin master
npm stop
cnpm install
# npm run test
EGG_SERVER_ENV=test  npm start
# npm run start