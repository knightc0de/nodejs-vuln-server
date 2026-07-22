#!/usr/bin/env bash

cleanup() {
  echo ""
  echo "stopping all servers"
  kill $(jobs -p) 2>/dev/null
  exit
}

trap cleanup SIGINT

echo "running backend..."
npm --prefix ./backend run dev &

echo "running frontend..."
npm --prefix ./frontend run dev &

wait
