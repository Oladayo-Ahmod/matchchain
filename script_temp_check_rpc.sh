#!/usr/bin/env bash
RPC_URL="$NEXT_PUBLIC_AMOY_RPC_URL"
[ -z "$RPC_URL" ] && RPC_URL="https://rpc-amoy.polygon.technology"
echo "Using RPC: $RPC_URL"
curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' "$RPC_URL" | jq .
 