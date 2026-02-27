#!/usr/bin/env bash
set -euo pipefail

OUT_NAME=${1:-BrandDNA-Studio-deploy.zip}
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

zip -r "$OUT_NAME" . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x ".next/*" \
  -x "*.zip" \
  -x "npm-debug.log*"

echo "Created $OUT_NAME"
