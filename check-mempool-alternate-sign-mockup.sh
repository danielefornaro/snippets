#!/bin/bash

CONF="-conf=/root/.bitcoin/bitcoin-main.conf"

while [ true ]; do
 sleep 1
 TX_IN_MEMPOOL=`bitcoin-cli $CONF getmempoolinfo | jq .size`
 if [[ TX_IN_MEMPOOL -gt 0 ]]
 then
  echo "There are tx in mempool"
  sleep 3
  TX_IN_MEMPOOL=`bitcoin-cli $CONF getmempoolinfo | jq .size`
  if [[ TX_IN_MEMPOOL -gt 0 ]]
  then
   echo "There are still tx in mempool"
   HEX=$(bitcoin-cli $CONF getnewblockhex)
   SIGN=$(bitcoin-cli $CONF signblock $HEX)
   BLOCKRESULT=$(bitcoin-cli $CONF combineblocksigs $HEX '''["'''$SIGN'''"]''')
   SIGNBLOCK=$(echo $BLOCKRESULT | python3 -c "import sys, json; print(json.load(sys.stdin)['hex'])")
   bitcoin-cli $CONF submitblock $SIGNBLOCK
  fi
 else
   echo "There are NO tx in mempool"
 fi
done
