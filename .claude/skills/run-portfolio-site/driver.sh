#!/bin/bash
# Driver for portfolio-site: launch the Next.js dev server, smoke-test the
# routes, and screenshot pages with headless Chrome. Agent-facing harness —
# see SKILL.md in this directory.
#
# Usage (from the repo root):
#   .claude/skills/run-portfolio-site/driver.sh start    # dev server, bg
#   .claude/skills/run-portfolio-site/driver.sh smoke    # curl route checks
#   .claude/skills/run-portfolio-site/driver.sh shot [url-path] [out.png] [WxH]
#   .claude/skills/run-portfolio-site/driver.sh stop
set -u
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
RUN="$REPO/.claude/skills/run-portfolio-site/.run"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p "$RUN"

# No fallback port: hitting localhost:3000 blind can reach a DIFFERENT
# checkout's dev server. smoke/shot require a prior successful `start`.
base_url() { cat "$RUN/url" 2>/dev/null || { echo "no server started by this driver — run: driver.sh start" >&2; exit 1; }; }

case "${1:-}" in
start)
  # Only trust a server this driver started (pid file) — port 3000 answering
  # is NOT enough: other checkouts of this repo (e.g. Codex clones under
  # ~/Documents/Codex/) run their own dev servers and serve stale content.
  if [ -f "$RUN/pid" ] && kill -0 "$(cat "$RUN/pid")" 2>/dev/null \
     && curl -s -o /dev/null "$(base_url)"; then
    echo "already running at $(base_url)"; exit 0
  fi
  rm -f "$RUN/url"
  # Dedicated port: on 3000, another checkout's server can coexist on the
  # same port (it binds IPv4 127.0.0.1, Next binds IPv6 wildcard) and
  # `localhost` then reaches EITHER depending on the client. 3210 avoids it.
  (cd "$REPO" && nohup npm run dev -- -p 3210 > "$RUN/dev.log" 2>&1 & echo $! > "$RUN/pid")
  for i in $(seq 1 30); do
    # -a: the log has ANSI/control bytes and grep otherwise says "Binary file"
    url=$(grep -aom1 'http://localhost:[0-9]*' "$RUN/dev.log" || true)
    [ -n "$url" ] && curl -s -o /dev/null "$url" && break
    sleep 1
  done
  [ -z "${url:-}" ] && { echo "FAILED to start; log tail:"; tail -5 "$RUN/dev.log"; exit 1; }
  echo "$url" > "$RUN/url"
  echo "running at $url (pid $(cat "$RUN/pid"), log $RUN/dev.log)"
  ;;
smoke)
  url=$(base_url); fail=0
  check() { # path, expected-substring
    body=$(curl -sf "$url$1") || { echo "FAIL $1 (http error)"; fail=1; return; }
    case "$body" in
      *"$2"*) echo "ok   $1" ;;
      *) echo "FAIL $1 (missing: $2)"; fail=1 ;;
    esac
  }
  check /                        "Stephen Aguila"
  check /                        "wynnbet (sportsbook)"
  check /exploration             "Exploration — Stephen Aguila"
  check /work/wb-sportsbook      "WynnBet"
  exit $fail
  ;;
shot)
  path="${2:-/}"; out="${3:-$RUN/shot.png}"; size="${4:-1440,2200}"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --window-size="$size" --virtual-time-budget=8000 \
    --screenshot="$out" "$(base_url)$path" 2>/dev/null
  [ -s "$out" ] && echo "screenshot: $out" || { echo "FAILED"; exit 1; }
  ;;
stop)
  # Kill only OUR server: the saved npm pid plus whatever listens on the port
  # we recorded. Never `pkill -f "next dev"` — other checkouts run their own.
  # 3210 is this driver's dedicated port, so sweeping it is always safe —
  # and necessary: killing the npm pid alone leaks the next-server child.
  lsof -tiTCP:3210 -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null
  [ -f "$RUN/pid" ] && kill "$(cat "$RUN/pid")" 2>/dev/null
  rm -f "$RUN/pid" "$RUN/url"
  echo "stopped"
  ;;
*)
  echo "usage: driver.sh start|smoke|shot [path] [out] [WxH]|stop"; exit 2 ;;
esac
