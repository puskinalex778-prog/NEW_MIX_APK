# Собирает единый index.html: игра + three.js + GLTFLoader + шрифты + модели (всё внутри, работает офлайн)
import base64, json, os, re, sys
B = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(B, '..', 'src')
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
head = open(os.path.join(SRC, 'head.html'), encoding='utf-8').read()
game = open(os.path.join(SRC, 'game.js'), encoding='utf-8').read()
three = open(os.path.join(SRC, 'importmap.txt'), encoding='utf-8').read()
m = re.search(r'"three":"(data:text/javascript;base64,[^"]+)"', three); three_url = m.group(1)
gl = open(os.path.join(B, 'GLTFLoader.js'), encoding='utf-8').read().replace("'../utils/BufferGeometryUtils.js'", "'three/addons/utils/BufferGeometryUtils.js'")
bgu = open(os.path.join(B, 'BufferGeometryUtils.js'), encoding='utf-8').read()
js = lambda t: 'data:text/javascript;base64,' + base64.b64encode(t.encode()).decode()
imap = {"imports": {"three": three_url, "three/addons/loaders/GLTFLoader.js": js(gl), "three/addons/utils/BufferGeometryUtils.js": js(bgu)}}
fonts = []
for fam, w, f in [('Russo One', 400, 'russo-one-cyrillic-400-normal'), ('Russo One', 400, 'russo-one-latin-400-normal')] + [('Inter', w, f'inter-{s}-{w}-normal') for w in (400, 600, 800) for s in ('cyrillic', 'latin')]:
    fonts.append(f"@font-face{{font-family:'{fam}';font-weight:{w};font-style:normal;font-display:swap;src:url(data:font/woff2;base64,{b64(os.path.join(B, f + '.woff2'))}) format('woff2')}}")
head = head.replace('<!--FONTS-->', '<style>' + ''.join(fonts) + '</style>')
MODELS = {}
city = os.path.join(B, 'kcity_models'); race = os.path.join(B, 'racing_models')
for k, f in [('house_a', 'building-small-a'), ('house_b', 'building-small-b'), ('house_c', 'building-small-c'), ('house_d', 'building-small-d')]:
    MODELS[k] = {'glb': 'data:model/gltf-binary;base64,' + b64(os.path.join(city, f + '.glb')), 'tex': 'data:image/png;base64,' + b64(os.path.join(city, 'Textures', 'colormap.png'))}
for c in ['red', 'green', 'yellow', 'purple']:
    MODELS['truck_' + c] = {'glb': 'data:model/gltf-binary;base64,' + b64(os.path.join(race, f'vehicle-truck-{c}.glb')), 'tex': 'data:image/png;base64,' + b64(os.path.join(race, 'Textures', 'colormap.png'))}
out = head + '<script>window.__MODELS=' + json.dumps(MODELS) + ';</script>\n<script type="importmap">' + json.dumps(imap) + '</script>\n' + game
dst = sys.argv[1] if len(sys.argv) > 1 else os.path.join(B, '..', 'dist', 'index.html')
open(dst, 'w', encoding='utf-8').write(out); print(dst, round(len(out) / 1024), 'KB')
