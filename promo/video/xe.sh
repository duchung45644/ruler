#!/bin/bash
# usage: xe.sh script.mjs out.mkv — run a take on a fresh 1920x1080 virtual display
cd "$(dirname "$0")"; export FF=$(find ../ffmpeg/node_modules -name ffmpeg -type f|head -1)
Xephyr :2 -screen 1920x1080 -ac -br -noreset >/dev/null 2>&1 & XP=$!; sleep 2
rm -rf profchat profbg; XE=1 timeout 120 node "$1" "$2" > live/r.log 2>&1
kill $XP 2>/dev/null; wait $XP 2>/dev/null
grep -E "^Error|ERR " live/r.log | head -3; true
