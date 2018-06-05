#! /bin/bash

git reset --hard origin/master
git clean -f
git pull origin master
cnpm install
# npm run test
EGG_SERVER_ENV=prod  npm start
# npm run start