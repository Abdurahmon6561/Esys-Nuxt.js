#!/bin/bash
set -e

SERVER="root@188.120.244.180"
REMOTE_DIR="/var/www/esys.pro"
APP_NAME="esys"

echo "==> Building on server..."
ssh "$SERVER" "
  set -e
  cd $REMOTE_DIR
  npm install
  npm run build
  pm2 describe $APP_NAME > /dev/null 2>&1 \
    && pm2 restart $APP_NAME \
    || pm2 start .output/server/index.mjs --name $APP_NAME
  pm2 save
"

echo "==> Done."
