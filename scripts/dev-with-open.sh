#!/usr/bin/env bash
# Starts Next on 127.0.0.1 (reliable for macOS + browsers), then opens Safari/Chrome when the server answers.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

HOST="127.0.0.1"
PORT="3100"
NEXT_BIN="$ROOT/node_modules/.bin/next"

# If something is already listening on this port, just open the browser (avoids duplicate Next error).
if lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  node "$ROOT/scripts/print-dev-link.mjs"
  echo ""
  echo ">>> Port ${PORT} is already in use — opening http://${HOST}:${PORT}/"
  echo "    (To fully restart: stop the other terminal or run  lsof -ti :${PORT} | xargs kill )"
  open "http://${HOST}:${PORT}/" 2>/dev/null || true
  exit 0
fi

if [[ ! -f "$NEXT_BIN" ]]; then
  echo "Run npm install first (missing $NEXT_BIN)"
  exit 1
fi

node "$ROOT/scripts/print-dev-link.mjs"

"$NEXT_BIN" dev --webpack --hostname "$HOST" --port "$PORT" &
NEXT_PID=$!

cleanup() {
  kill "$NEXT_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

opened=0
for _ in $(seq 1 120); do
  if curl -sf "http://${HOST}:${PORT}/" >/dev/null 2>&1; then
    if [[ "$opened" -eq 0 ]]; then
      opened=1
      echo ""
      echo ">>> Server is up — opening your default browser at http://${HOST}:${PORT}/"
      open "http://${HOST}:${PORT}/" 2>/dev/null || true
    fi
    break
  fi
  sleep 0.25
done

if [[ "$opened" -eq 0 ]]; then
  echo ""
  echo "WARNING: No HTTP response yet. When you see 'Ready', open: http://${HOST}:${PORT}/"
fi

wait "$NEXT_PID"
exit_code=$?
trap - INT TERM EXIT
exit "$exit_code"
