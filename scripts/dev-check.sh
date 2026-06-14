#!/usr/bin/env bash
set -euo pipefail

echo "Checking API build metadata..."
mvn -f apps/api/pom.xml -q -DskipTests validate

echo "Checking frontend package metadata..."
node -e "JSON.parse(require('fs').readFileSync('apps/web/package.json','utf8')); console.log('web package ok')"

echo "Done."
