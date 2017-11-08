#!/bin/bash
while [ true ]; do
 sleep 1
 TX_IN_MEMPOOL=`bitcoin-cli getmempoolinfo | jq .size`
 if [[ TX_IN_MEMPOOL -gt 0 ]]
 then
  echo "There are tx in mempool"
  HEX=$(bitcoin-cli getnewblockhex)
  SIGN=$(bitcoin-cli signblock $HEX)
  BLOCKRESULT=$(bitcoin-cli combineblocksigs $HEX '''["'''$SIGN'''"]''')
  SIGNBLOCK=$(echo $BLOCKRESULT | python3 -c "import sys, json; print(json.load(sys.stdin)['hex'])")
  bitcoin-cli submitblock $SIGNBLOCK
 else
  echo "There are NO tx in mempool"
 fi
done

