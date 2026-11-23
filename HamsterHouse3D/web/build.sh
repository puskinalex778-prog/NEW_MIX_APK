#!/bin/sh
# Сборка JS-бандла игры в Android-ассеты
npx esbuild src/main.js --bundle --minify --format=iife --target=es2019 --outfile=../app/src/main/assets/game.js
