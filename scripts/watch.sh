#!/usr/bin/env bash

set -e

esbuild --watch \
  --bundle --sourcemap=external --minify --charset=utf8 \
  --target=es2020 \
  --format=iife --global-name=EmojiPicker \
  --outfile=./www/index.js \
  ./src/index.ts
