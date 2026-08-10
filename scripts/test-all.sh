#!/usr/bin/env bash
set -e
echo "Running AeroDeck Master Test Suite..."
node scripts/test-runner.js "$@"
