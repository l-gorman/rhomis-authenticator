#!/bin/bash
./node_modules/.bin/cross-env NODE_ENV=prod ./node_modules/.bin/pm2 start ./app.js
