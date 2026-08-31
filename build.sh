#!/bin/zsh
# Rebuild the dependency-free, plain-JS bundle that run.sh ships (server.mjs).
# Run this after any change to server.ts / cards.ts / widgetKit.ts / mark.ts / logos.ts.
# Requires bun (build-time only; the OUTPUT runs on any Node >=18 with no bun).
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
export PATH="$HOME/.bun/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
bun build "$DIR/server.ts" --target=node --format=esm --outfile="$DIR/server.mjs"
echo "built server.mjs ($(wc -c < "$DIR/server.mjs") bytes)"
