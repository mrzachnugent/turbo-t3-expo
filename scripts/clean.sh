#!/bin/bash
echo "[1/2] Deleting all node_modules..."
find . -type d -name "node_modules" -exec rm -rf '{}' +

echo "[2/2] Deleting yarn.lock..."
rm -rf yarn.lock

echo "Cleanup Done! ✅"
