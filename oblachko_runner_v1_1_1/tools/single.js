// Builds dist/oblachko_single.html: one file with all models, audio, code and styles inlined.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), www = path.join(root, 'www');
const embed = {};
const mime = { glb: 'model/gltf-binary', ogg: 'audio/ogg' };
function walk(dir, rel = '') {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f), r = rel ? rel + '/' + f : f;
    if (fs.statSync(p).isDirectory()) walk(p, r);
    else { const ext = f.split('.').pop(); if (mime[ext]) embed[r] = 'data:' + mime[ext] + ';base64,' + fs.readFileSync(p).toString('base64'); }
  }
}
walk(path.join(www, 'assets'));
let html = fs.readFileSync(path.join(www, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(www, 'style.css'), 'utf8');
const js = fs.readFileSync(path.join(www, 'game.js'), 'utf8').replace(/<\/script/g, '<\\/script');
html = html.replace('<link rel="stylesheet" href="style.css">', () => '<style>' + css + '</style>');
html = html.replace('<script src="game.js"></script>', () => '<script>window.__EMBED=' + JSON.stringify(embed) + ';</script>\n<script>' + js + '</script>');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'oblachko_single.html'), html);
console.log('dist/oblachko_single.html', (html.length / 1048576).toFixed(1) + ' MB');
