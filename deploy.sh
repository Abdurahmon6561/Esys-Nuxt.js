#!/bin/bash
set -e

SERVER="root@109.199.108.93"
REMOTE_DIR="/var/www/esys.pro"
APP_NAME="esys"

echo "==> Deploying on server..."
ssh "$SERVER" bash << 'ENDSSH'
  set -e
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
  export PATH="$PATH:/usr/local/bin"

  cd /var/www/esys.pro
  git pull

  npm install
  npm run build

  APP=esys
  pm2 describe $APP > /dev/null 2>&1 \
    && pm2 restart $APP \
    || pm2 start .output/server/index.mjs --name $APP
  pm2 save
ENDSSH

echo "==> Done."
