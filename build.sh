#!/usr/bin/env bash
# Bundles each entry in src/ into a self-contained file at the repo root.
#
# Why bundle at all, given these are plain ES modules? HACS installs a plugin by
# downloading .js files into www/community/<repo>/, and we cannot rely on every
# file arriving. A card whose module does `import "./shared.js"` dies completely
# if that one file is missing, taking every card in it down with it. Bundling
# removes all runtime imports except lit, so each shipped file stands alone.
#
# lit stays an external https import: the browser fetches it from the CDN, and
# esbuild cannot resolve URLs anyway.
#
# Requires node. esbuild is fetched on demand by npx, so there is nothing to
# install and no node_modules in the repo.
set -euo pipefail

cd "$(dirname "$0")"

ENTRIES=(
  "ha-cards"        # every card, one resource
  "wind-dir-card"   # standalone; also keeps the pre-collection resource URL working
  "sensor-ex-card"  # standalone
  "distribution-ex-card" # standalone
)

for entry in "${ENTRIES[@]}"; do
  npx --yes esbuild "src/${entry}.js" \
    --bundle \
    --format=esm \
    --external:https://* \
    --banner:js="// Generated from src/${entry}.js by build.sh - do not edit directly." \
    --outfile="${entry}.js"
done

VERSION=$(grep -o 'VERSION = "[^"]*"' src/shared.js | head -1 | cut -d'"' -f2)
echo "Built: ${ENTRIES[*]/%/.js}"
# Printed loudly because the console banner is how an install is identified;
# shipping a stale VERSION makes that banner lie about which build is running.
echo "Embedded VERSION: ${VERSION}  <- must match the tag you are about to cut"
