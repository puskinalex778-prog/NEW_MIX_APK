#!/usr/bin/env python3
"""Собирает игру в один файл www/index.html (шрифты, стили и скрипты внутри — работает офлайн)."""
import base64, pathlib

root = pathlib.Path(__file__).parent
fonts = ""
for w in (500, 800, 900):
    for sub, rng in (("latin", "U+0000-00FF,U+2000-206F,U+20AC,U+2122"), ("cyrillic", "U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116")):
        b64 = base64.b64encode((root / f"fonts/nunito-{sub}-{w}-normal.woff2").read_bytes()).decode()
        fonts += f"@font-face{{font-family:Nunito;font-weight:{w};font-display:swap;src:url(data:font/woff2;base64,{b64}) format('woff2');unicode-range:{rng}}}\n"

css = (root / "src/style.css").read_text(encoding="utf-8").replace("/*FONTS*/", fonts)
js = "\n".join((root / f"src/{n}.js").read_text(encoding="utf-8") for n in ("art", "content", "game"))
html = f"""<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#5f8dff">
<title>Острова знаний</title>
<style>{css}</style></head>
<body><div id="scene"></div><div id="app"></div>
<script>{js}</script></body></html>"""
out = root / "www/index.html"
out.write_text(html, encoding="utf-8")
print(out, round(len(html) / 1024), "KB")
