#!/usr/bin/env bash
# FlawTrack Deployment Smoke Test Runner
set -e

BACKEND_URL="${1:-${BACKEND_URL:-http://localhost:5000}}"
FRONTEND_URL="${2:-${FRONTEND_URL:-http://localhost:5173}}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$SCRIPT_DIR/smoke-test.js" "$BACKEND_URL" "$FRONTEND_URL"
