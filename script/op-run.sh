#!/bin/sh
# runs <cmd> with every op:// reference in op.env resolved, through the x-fleet service account
# (token in the login keychain, no touch id). usage: script/op-run.sh <cmd> [args…]
set -eu
repo=$(cd "$(dirname "$0")/.." && pwd)
OP_SERVICE_ACCOUNT_TOKEN=$(security find-generic-password -s op-service-account-x-fleet -w) \
  exec op run --env-file="$repo/op.env" -- "$@"
