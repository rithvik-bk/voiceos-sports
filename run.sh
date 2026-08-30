#!/bin/zsh
# Launcher for the NFL/NBA (Sports) VoiceOS local-mcp integration.
# LAW: stdout is the MCP wire. Every diagnostic goes to stderr (>&2). One stray echo to stdout
# corrupts the JSON-RPC stream. The server is zero-dependency TypeScript (Node/Bun native TS).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export PATH="$HOME/.bun/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

NODE="$(command -v node 2>/dev/null || true)"
if [[ -n "$NODE" ]]; then
  exec "$NODE" "$SCRIPT_DIR/server.ts" "$@"
fi

BUN=""
for candidate in "$HOME/.bun/bin/bun" /opt/homebrew/bin/bun "$(command -v bun 2>/dev/null || true)"; do
  if [[ -n "$candidate" && -x "$candidate" ]]; then BUN="$candidate"; break; fi
done
if [[ -n "$BUN" ]]; then
  exec "$BUN" "$SCRIPT_DIR/server.ts" "$@"
fi

NODE="$(command -v node 2>/dev/null || true)"
if [[ -n "$NODE" ]]; then
  exec "$NODE" "$SCRIPT_DIR/server.ts" "$@"
fi

echo "[run.sh] no bun or modern node found on PATH" >&2
exit 1
