#!/usr/bin/env bash
set -euo pipefail

python3 landscaping_screenshot_crawler.py \
  --input landscaping_screenshot_targets.csv \
  --output-dir ./landscaping_screenshot_run \
  --full-page \
  --concurrency 4 \
  --timeout-ms 30000
