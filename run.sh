#!/bin/zsh
# Launcher for the "Sports" VoiceOS local-mcp integration (multi-sport, ESPN keyless).
# LAW: stdout is the MCP wire. Every diagnostic goes to stderr (>&2). One stray echo to stdout
# corrupts the JSON-RPC stream.
#
# PORTABILITY: the server is zero-dependency, but it is authored in TypeScript with `.ts` imports.
# Node only runs `.ts` unflagged on >=22.18; an older Node throws ERR_UNKNOWN_FILE_EXTENSION, which
# VoiceOS surfaces as "A required module is missing." To run anywhere, we ship a prebuilt,
# dependency-free `server.mjs` (plain JS, no `.ts`, no type syntax) and prefer it: it runs on ANY
# Node >=18 with no flags and no bun. The TypeScript source paths below are dev fallbacks.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export PATH="$HOME/.bun/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

NODE="$(command -v node 2>/dev/null || true)"

# 1) Preferred: the prebuilt bundle on any Node >=18. This is the path a cloned repo uses.
if [[ -n "$NODE" && -f "$SCRIPT_DIR/server.mjs" ]]; then
  exec "$NODE" "$SCRIPT_DIR/server.mjs" "$@"
fi

# 2) Bun runs the TypeScript source directly regardless of version (dev, or no bundle present).
BUN=""
for candidate in "$HOME/.bun/bin/bun" /opt/homebrew/bin/bun "$(command -v bun 2>/dev/null || true)"; do
  if [[ -n "$candidate" && -x "$candidate" ]]; then BUN="$candidate"; break; fi
done
if [[ -n "$BUN" ]]; then
  exec "$BUN" "$SCRIPT_DIR/server.ts" "$@"
fi

# 3) Node >=22.18 strips types and runs .ts unflagged (only reached if the bundle is missing).
if [[ -n "$NODE" ]]; then
  exec "$NODE" "$SCRIPT_DIR/server.ts" "$@"
fi

echo "[sports] No JS runtime found. Install Node >=18 (runs the bundled server.mjs) or bun." >&2
exit 1
