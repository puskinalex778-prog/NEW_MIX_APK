"""Original procedural score + SFX for the runner. numpy/scipy synthesis -> ogg via ffmpeg."""
import numpy as np, random, subprocess, os, sys
from scipy.signal import lfilter, butter, fftconvolve, sosfilt

SR = 44100
OUT = '/home/claude/game/www/assets/audio'
os.makedirs(OUT, exist_ok=True)
NOTE = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a=0.005, d=0.1, s=0.7, r=0.1, dur=None):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    if dur is None:
        dur = n
    hold = max(0, dur - a - d)
    e = np.concatenate([np.linspace(0, 1, max(a, 1)), np.linspace(1, s, max(d, 1)), np.full(hold, s), np.linspace(s, 0, max(r, 1))])
    out = np.zeros(n)
    m = min(n, len(e))
    out[:m] = e[:m]
    return out


def lp(x, fc, order=2):
    fc = min(fc, SR * 0.45)
    sos = butter(order, fc / (SR / 2), 'low', output='sos')
    return sosfilt(sos, x)


def hp(x, fc, order=2):
    sos = butter(order, fc / (SR / 2), 'high', output='sos')
    return sosfilt(sos, x)


def bp(x, lo, hi, order=2):
    sos = butter(order, [lo / (SR / 2), min(hi, SR * 0.45) / (SR / 2)], 'band', output='sos')
    return sosfilt(sos, x)


rng = np.random.default_rng(7)


# ---------------- instruments -----------------
def pluck(f, dur, bright=0.5, decay=0.996, body=True):
    n = int(SR * (dur + 0.6))
    N = max(2, int(SR / f))
    exc = rng.uniform(-1, 1, N)
    exc = lp(exc, 1500 + bright * 7000)
    x = np.zeros(n)
    x[:N] = exc
    a = np.zeros(N + 2)
    a[0] = 1
    a[N] = -decay / 2
    a[N + 1] = -decay / 2
    y = lfilter([1], a, x)
    y *= env(n, 0.001, 0.02, 1, 0.08, int(SR * dur) + int(0.25 * SR))
    if body:
        y = y + 0.3 * bp(y, 180, 900)
    return y / (np.max(np.abs(y)) + 1e-9)


def fm(f, dur, ratio=2.0, index=2.0, idecay=4.0, adecay=2.5, attack=0.002, rel=0.2):
    n = int(SR * (dur + rel + 0.3))
    t = np.arange(n) / SR
    I = index * np.exp(-t * idecay)
    y = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * ratio * t))
    e = np.exp(-t * adecay) * np.minimum(1, t / attack)
    cut = int(SR * dur)
    e[cut:] *= np.exp(-(t[cut:] - t[cut]) / max(rel, 1e-3) * 4)
    return y * e


def saw(f, n, detune=0.0):
    t = np.arange(n) / SR
    y = np.zeros(n)
    for d in ([0] if detune == 0 else [-detune, 0, detune]):
        ff = f * (1 + d)
        y += 2 * ((t * ff) % 1) - 1
    return y / (1 if detune == 0 else 3)


def pad(f, dur, bright=1800, detune=0.006):
    n = int(SR * (dur + 0.6))
    y = saw(f, n, detune) + 0.5 * saw(f * 2, n, detune * 1.3)
    y = lp(y, bright)
    return y * env(n, 0.25, 0.3, 0.8, 0.5, int(SR * dur)) * 0.5


def organ(f, dur, vib=5.0):
    """accordion-ish reed"""
    n = int(SR * (dur + 0.2))
    t = np.arange(n) / SR
    ph = 2 * np.pi * f * t + 0.004 * f / vib * np.sin(2 * np.pi * vib * t) * 2 * np.pi
    y = np.sign(np.sin(ph)) * 0.4 + saw(f * 1.003, n) * 0.5 + np.sin(ph * 2) * 0.2
    y = lp(y, 2600)
    return y * env(n, 0.03, 0.1, 0.75, 0.12, int(SR * dur)) * 0.45


def flute(f, dur):
    n = int(SR * (dur + 0.25))
    t = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.3)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    y = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    br = bp(rng.normal(0, 1, n), f * 0.8, f * 3) * 0.12
    return (y + br) * env(n, 0.05, 0.08, 0.8, 0.12, int(SR * dur)) * 0.6


def brass(f, dur):
    n = int(SR * (dur + 0.15))
    t = np.arange(n) / SR
    y = saw(f, n, 0.003)
    e = env(n, 0.03, 0.12, 0.8, 0.1, int(SR * dur))
    cut = 600 + 3500 * env(n, 0.04, 0.2, 0.45, 0.1, int(SR * dur))
    # time-varying lowpass approximation: blend two filtered versions
    lo, hi = lp(y, 700), lp(y, 4000)
    k = (cut - 600) / 3500
    return (lo * (1 - k) + hi * k) * e * 0.5


def bass(f, dur, kind='round'):
    n = int(SR * (dur + 0.12))
    t = np.arange(n) / SR
    if kind == 'round':
        y = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sign(np.sin(2 * np.pi * f * t))
        y = lp(y, 900)
    elif kind == 'synth':
        y = lp(saw(f, n), 500 + 900 * np.exp(-t * 10).mean())
    else:  # pluck bass
        y = pluck(f, dur, 0.2, 0.993, body=False)[:n]
    return y * env(n, 0.004, 0.08, 0.75, 0.06, int(SR * dur)) * 0.8


def addp(a, b):
    n = max(len(a), len(b))
    out = np.zeros(n)
    out[:len(a)] += a
    out[:len(b)] += b
    return out


def marimba(f, dur):
    return addp(fm(f, min(dur, 0.6), ratio=3.99, index=1.6, idecay=18, adecay=6, rel=0.1) * 0.8, fm(f, min(dur, 0.6), 1, 0.3, 5, 5, rel=0.1) * 0.4)


def bell(f, dur):
    return fm(f, dur, ratio=3.5, index=3.0, idecay=3, adecay=2.2, rel=0.6) * 0.5


def celesta(f, dur):
    return fm(f, dur, ratio=4.0, index=1.2, idecay=6, adecay=3.5, rel=0.3) * 0.55


def epiano(f, dur):
    return addp(fm(f, dur, ratio=1.0, index=1.8, idecay=3.5, adecay=1.6, rel=0.25) * 0.6,
                fm(f, dur, ratio=14.0, index=0.6, idecay=25, adecay=8, rel=0.05) * 0.15)


def steel(f, dur):
    return fm(f, min(dur, 0.8), ratio=2.76, index=2.2, idecay=6, adecay=3.2, rel=0.2) * 0.6


def koto(f, dur):
    y = pluck(f, dur, 0.85, 0.997, body=False)
    t = np.arange(len(y)) / SR
    return y * (1 + 0.0 * t) * 0.8


def pizz(f, dur):
    return pluck(f, min(dur, 0.35), 0.4, 0.985) * 0.8


INSTR = dict(pluck=lambda f, d: pluck(f, d, 0.55) * 0.55, uke=lambda f, d: pluck(f, d, 0.75, 0.993) * 0.5,
             nylon=lambda f, d: pluck(f, d, 0.35, 0.995) * 0.6, organ=organ, flute=flute, brass=brass,
             marimba=marimba, bell=bell, celesta=celesta, epiano=epiano, steel=steel, koto=koto, pizz=pizz, pad=pad)


# ---------------- drums -----------------
def kick(v=1.0):
    n = int(SR * 0.35)
    t = np.arange(n) / SR
    f = 50 + 110 * np.exp(-t * 30)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    y[:200] += rng.normal(0, 0.3, 200) * np.linspace(1, 0, 200)
    return y * v


def snare(v=1.0, soft=False):
    n = int(SR * 0.25)
    t = np.arange(n) / SR
    nz = bp(rng.normal(0, 1, n), 1200, 9000) * np.exp(-t * (22 if not soft else 30))
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25)
    return (nz * 0.7 + tone * 0.5) * v * (0.6 if soft else 1)


def hat(v=1.0, open_=False):
    n = int(SR * (0.3 if open_ else 0.06))
    t = np.arange(n) / SR
    y = hp(rng.normal(0, 1, n), 7000) * np.exp(-t * (12 if open_ else 70))
    return y * v * 0.35


def shaker(v=1.0):
    n = int(SR * 0.09)
    t = np.arange(n) / SR
    y = bp(rng.normal(0, 1, n), 4000, 12000) * np.sin(np.pi * t / t[-1]) ** 2
    return y * v * 0.3


def clap(v=1.0):
    n = int(SR * 0.22)
    y = np.zeros(n)
    for k, off in enumerate([0, 0.01, 0.02]):
        s = int(off * SR)
        m = n - s
        t = np.arange(m) / SR
        y[s:] += bp(rng.normal(0, 1, m), 900, 6000) * np.exp(-t * (60 if k < 2 else 18))
    return y * v * 0.6


def sleigh(v=1.0):
    n = int(SR * 0.25)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for k in range(6):
        f = rng.uniform(5000, 9000)
        y += np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * np.exp(-t * rng.uniform(18, 35))
    y += hp(rng.normal(0, 1, n), 6000) * np.exp(-t * 30) * 0.5
    return y * v * 0.18


def woodblock(v=1.0, hi=True):
    n = int(SR * 0.12)
    t = np.arange(n) / SR
    f = 1250 if hi else 900
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.7 * t)) * np.exp(-t * 45) * v * 0.4


DRUM = dict(k=kick, s=snare, r=lambda v: snare(v, True), h=hat, o=lambda v: hat(v, True), x=shaker, c=clap, j=sleigh,
            w=woodblock, b=lambda v: woodblock(v, False))


# ---------------- mixing helpers -----------------
class Mix:
    def __init__(self, seconds):
        self.n = int(SR * seconds)
        self.L = np.zeros(self.n + SR * 4)
        self.R = np.zeros(self.n + SR * 4)
        self.rvL = np.zeros_like(self.L)
        self.rvR = np.zeros_like(self.R)

    def add(self, sig, t, gain=1.0, pan=0.0, rev=0.15):
        s = int(t * SR)
        e = min(len(self.L), s + len(sig))
        if s >= len(self.L):
            return
        sig = sig[:e - s] * gain
        l = np.cos((pan + 1) * np.pi / 4)
        r = np.sin((pan + 1) * np.pi / 4)
        self.L[s:e] += sig * l
        self.R[s:e] += sig * r
        if rev:
            self.rvL[s:e] += sig * l * rev
            self.rvR[s:e] += sig * r * rev

    def render(self, loop=True, room=1.6):
        n_ir = int(SR * room)
        t = np.arange(n_ir) / SR
        irL = rng.normal(0, 1, n_ir) * np.exp(-t * 3.2 / room * 2)
        irR = rng.normal(0, 1, n_ir) * np.exp(-t * 3.2 / room * 2)
        irL, irR = lp(irL, 5000), lp(irR, 5000)
        irL /= np.sqrt(np.sum(irL ** 2))
        irR /= np.sqrt(np.sum(irR ** 2))
        L = self.L + fftconvolve(self.rvL, irL)[:len(self.L)] * 0.9
        R = self.R + fftconvolve(self.rvR, irR)[:len(self.R)] * 0.9
        if loop:
            tail_L, tail_R = L[self.n:], R[self.n:]
            L, R = L[:self.n].copy(), R[:self.n].copy()
            m = min(len(tail_L), self.n)
            L[:m] += tail_L[:m]
            R[:m] += tail_R[:m]
        else:
            L, R = L[:self.n + SR * 2], R[:self.n + SR * 2]
        st = np.stack([L, R], 1)
        st = hp(st.T, 30).T
        pk = np.max(np.abs(st)) + 1e-9
        st = st / pk * 1.4
        st = np.tanh(st) / np.tanh(1.4) * 0.89
        return st


def write(name, st, q=5):
    raw = (np.clip(st, -1, 1) * 32767).astype('<i2').tobytes()
    path = os.path.join(OUT, name + '.ogg')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', str(st.shape[1]),
                    '-i', '-', '-c:a', 'libvorbis', '-q:a', str(q), path], input=raw, check=True)
    return path


# ---------------- composition -----------------
SCALES = {'major': [0, 2, 4, 5, 7, 9, 11], 'minor': [0, 2, 3, 5, 7, 8, 10], 'dorian': [0, 2, 3, 5, 7, 9, 10],
          'penta': [0, 2, 4, 7, 9], 'mixo': [0, 2, 4, 5, 7, 9, 10]}
CHORD = {'': [0, 4, 7], 'm': [0, 3, 7], '7': [0, 4, 7, 10], 'maj7': [0, 4, 7, 11], 'm7': [0, 3, 7, 10], 'sus': [0, 5, 7], '6': [0, 4, 7, 9], 'add9': [0, 4, 7, 14]}


def parse_chord(c):
    root = c[:2] if len(c) > 1 and c[1] in '#b' else c[:1]
    q = c[len(root):]
    return NOTE[root], CHORD.get(q, CHORD[''])


def compose(cfg):
    seed = cfg.get('seed', 1)
    rr = random.Random(seed)
    bpm = cfg['bpm']
    beat = 60 / bpm
    bar = beat * 4
    prog = cfg['prog']  # list of bars (A then B)
    nbars = len(prog)
    mix = Mix(nbars * bar)
    swing = cfg.get('swing', 0.0)
    key = NOTE[cfg['key']]
    scale = SCALES[cfg.get('scale', 'major')]
    sc_notes = sorted({key + 12 * o + s for o in range(2, 8) for s in scale})

    def T(b, pos):  # pos in 16ths
        t = b * bar + pos * beat / 4
        if swing and pos % 2 == 1:
            t += swing * beat / 4
        return t

    # drums
    for b in range(nbars):
        pats = cfg['drums'] if b % 8 != 7 or 'fill' not in cfg else cfg['fill']
        for inst, pat in pats.items():
            for i, ch in enumerate(pat):
                if ch in '123456789':
                    v = int(ch) / 9
                    g = cfg.get('dgain', {}).get(inst, 1.0)
                    pan = {'h': 0.3, 'x': -0.35, 'j': 0.4, 'o': 0.3, 'w': -0.3, 'b': 0.3}.get(inst, 0)
                    mix.add(DRUM[inst](v * (0.95 + rr.random() * 0.1)), T(b, i), 0.55 * g, pan, rev=0.08 if inst in 'kh' else 0.15)

    # bass
    bk = cfg.get('bass', 'round')
    bpat = cfg.get('bpat', [(0, 0, 3), (8, 7, 3)])
    for b, c in enumerate(prog):
        r, q = parse_chord(c)
        nxt = parse_chord(prog[(b + 1) % nbars])[0]
        base = 36 + ((r - 0) % 12)
        if base > 45:
            base -= 12
        for pos, iv, ln in bpat:
            if iv == 'a':  # approach to next root (chromatic from below)
                nb = 36 + nxt % 12
                if nb > 45:
                    nb -= 12
                m = nb - 1
            else:
                m = base + iv
            mix.add(bass(mtof(m), ln * beat / 4, bk), T(b, pos), cfg.get('bgain', 0.8), 0, rev=0.03)

    # chords / comping
    comp = cfg['comp']
    for b, c in enumerate(prog):
        r, q = parse_chord(c)
        voicing = [60 + (r + iv - 60) % 12 + 48 if False else 0 for iv in q]
        base = 52 + (r - 52) % 12
        notes = [base + iv for iv in q]
        notes = [n - 12 if n > 69 else n for n in notes]
        for pos, ln, vel in comp['pat']:
            for k, nn in enumerate(sorted(notes)):
                sig = INSTR[comp['inst']](mtof(nn), ln * beat / 4)
                mix.add(sig, T(b, pos) + k * comp.get('strum', 0.012), comp.get('gain', 0.3) * vel, comp.get('pan', -0.25), rev=0.2)
    if 'pad' in cfg:
        for b, c in enumerate(prog):
            r, q = parse_chord(c)
            base = 55 + (r - 55) % 12
            for iv in q[:3]:
                mix.add(pad(mtof(base + iv), bar, cfg['pad'].get('bright', 1600)), T(b, 0), cfg['pad'].get('gain', 0.12), 0.0, rev=0.35)

    # melody: motif-based
    mel = cfg['melody']
    lo, hi = mel.get('range', (67, 84))
    motifs = {}

    def make_motif(seed2, density):
        r2 = random.Random(seed2)
        rhythm = []
        pos = 0
        while pos < 32:
            ln = r2.choice(mel.get('lens', [2, 2, 4, 4, 6, 8]))
            if pos + ln > 32:
                ln = 32 - pos
            rest = r2.random() > density
            rhythm.append((pos, ln, rest))
            pos += ln
        contour = [r2.choice([-2, -1, -1, 1, 1, 2, 0, 3, -3]) for _ in rhythm]
        return rhythm, contour

    sections = cfg.get('sections', 'AABA' if nbars >= 16 else 'AB')
    per = nbars // len(sections)
    cur = (lo + hi) // 2
    for si, sec in enumerate(sections):
        if sec not in motifs:
            motifs[sec] = make_motif(seed * 31 + ord(sec), mel.get('density', 0.8))
        rhythm, contour = motifs[sec]
        for half in range(per // 2):
            b0 = si * per + half * 2
            cur = (lo + hi) // 2 + (4 if sec == 'B' else 0)
            for idx, (pos, ln, rest) in enumerate(rhythm):
                b = b0 + pos // 16
                p16 = pos % 16
                if b >= nbars:
                    continue
                if rest and not (half == per // 2 - 1 and idx == len(rhythm) - 1):
                    continue
                r, q = parse_chord(prog[b])
                chord_pcs = [(r + iv) % 12 for iv in q]
                target = cur + contour[idx] * 2
                if half % 2 == 1 and idx >= len(rhythm) - 3:
                    target = cur + contour[idx] * -1 * 2
                strong = p16 % 8 == 0
                cands = [n for n in sc_notes if lo <= n <= hi]
                if strong:
                    cands = [n for n in cands if n % 12 in chord_pcs] or cands
                m = min(cands, key=lambda n: abs(n - target) + rr.random() * 0.8)
                # ending of section resolves to chord root
                if half == per // 2 - 1 and idx == len(rhythm) - 1:
                    m = min([n for n in range(lo, hi + 1) if n % 12 == r % 12] or [m], key=lambda n: abs(n - cur))
                cur = m
                dur = ln * beat / 4 * mel.get('legato', 0.9)
                sig = INSTR[mel['inst']](mtof(m), dur)
                mix.add(sig, T(b, p16), mel.get('gain', 0.35) * (1.0 if strong else 0.85), mel.get('pan', 0.15), rev=0.25)
                if 'double' in mel and (sec == 'B' or si == len(sections) - 1):
                    mix.add(INSTR[mel['double']](mtof(m + 12), dur), T(b, p16), mel.get('dgain', 0.15), -0.3, rev=0.35)

    # sparkle arpeggio
    if 'arp' in cfg:
        ap = cfg['arp']
        for b, c in enumerate(prog):
            if ap.get('every', 1) > 1 and b % ap['every'] != ap['every'] - 1:
                continue
            r, q = parse_chord(c)
            base = 72 + (r - 72) % 12
            seq = [base + iv for iv in q] + [base + 12]
            for i, pos in enumerate(ap.get('pos', [0, 2, 4, 6, 8, 10, 12, 14])):
                mix.add(INSTR[ap['inst']](mtof(seq[i % len(seq)]), ap.get('len', 0.25)), T(b, pos), ap.get('gain', 0.12), 0.45, rev=0.35)
    return mix.render(room=cfg.get('room', 1.6))


D4 = {'k': '9...............9.......', }

TRACKS = {
    'menu': dict(bpm=92, key='F', prog=['F', 'Am', 'Bb', 'C', 'F', 'Dm', 'Gm7', 'C', 'Bb', 'C', 'Am', 'Dm', 'Gm7', 'C', 'F', 'F'],
                 drums={'k': '9.......5.......', 'r': '....5.......5...', 'x': '..4...4...4...4.'},
                 comp=dict(inst='uke', pat=[(0, 4, 1), (6, 2, .7), (8, 4, .9), (12, 4, .7)], gain=0.22),
                 pad=dict(gain=0.08), melody=dict(inst='bell', range=(65, 82), gain=0.32, density=0.7, lens=[4, 4, 8, 2]),
                 bass='round', bpat=[(0, 0, 6), (8, 7, 6)], room=2.2, seed=3),
    'farm': dict(bpm=124, key='G', swing=0.12, prog=['G', 'C', 'D', 'G', 'G', 'C', 'Am', 'D', 'C', 'G', 'D', 'Em', 'C', 'G', 'D7', 'G'],
                 drums={'k': '9.......9.......', 's': '....8.......8...', 'h': '7.5.7.5.7.5.7.5.'},
                 comp=dict(inst='uke', pat=[(0, 2, 1), (4, 2, .7), (6, 2, .8), (10, 2, .7), (12, 2, .9)], gain=0.2),
                 melody=dict(inst='organ', range=(67, 83), gain=0.32, density=0.85, double='flute'),
                 bass='round', bpat=[(0, 0, 3), (4, 7, 2), (8, 0, 3), (12, 7, 2)], arp=dict(inst='marimba', every=4, gain=0.1), seed=11),
    'city': dict(bpm=116, key='Bb', swing=0.1, prog=['Bbmaj7', 'Gm7', 'Cm7', 'F7', 'Bbmaj7', 'Gm7', 'Ebmaj7', 'F7', 'Cm7', 'F7', 'Dm7', 'Gm7', 'Ebmaj7', 'F7', 'Bbmaj7', 'F7'],
                 drums={'k': '9.....6...9.....', 's': '....9.......9...', 'h': '6464646464646464', 'o': '..............5.'},
                 comp=dict(inst='epiano', pat=[(2, 2, .8), (6, 3, 1), (11, 2, .7)], gain=0.2, strum=0.005),
                 melody=dict(inst='flute', range=(70, 86), gain=0.3, density=0.8, lens=[2, 2, 2, 4, 6]),
                 bass='synth', bpat=[(0, 0, 2), (3, 0, 1), (6, 12, 2), (8, 7, 2), (11, 10, 1), (14, 'a', 2)], bgain=0.7, seed=21),
    'market': dict(bpm=104, key='C', prog=['Cmaj7', 'Am7', 'Dm7', 'G7', 'Cmaj7', 'A7', 'Dm7', 'G7', 'Fmaj7', 'Em7', 'Dm7', 'G7', 'Em7', 'A7', 'Dm7', 'G7'],
                   drums={'k': '9......69.......', 'w': '9..9..9...9..9..', 'x': '5757575757575757'},
                   comp=dict(inst='nylon', pat=[(0, 3, 1), (3, 3, .7), (6, 4, .8), (10, 3, .7), (13, 3, .8)], gain=0.2, strum=0.006),
                   melody=dict(inst='marimba', range=(67, 86), gain=0.32, density=0.75), bass='pluck',
                   bpat=[(0, 0, 3), (6, 7, 2), (8, 7, 3), (14, 0, 2)], pad=dict(gain=0.05), seed=31),
    'depot': dict(bpm=90, key='A', scale='minor', swing=0.15, prog=['Am7', 'Fmaj7', 'Dm7', 'E7', 'Am7', 'Fmaj7', 'Bm7', 'E7', 'Fmaj7', 'G', 'Em7', 'Am7', 'Dm7', 'G', 'Fmaj7', 'E7'],
                  drums={'k': '9.........7.....', 'r': '....8.......8...', 'h': '5.4.5.4.5.4.5.45'},
                  comp=dict(inst='epiano', pat=[(0, 6, 1), (8, 6, .8), (14, 2, .5)], gain=0.24, strum=0.01),
                  melody=dict(inst='celesta', range=(69, 86), gain=0.3, density=0.65, lens=[4, 4, 2, 6, 8]), pad=dict(gain=0.07, bright=1200),
                  bass='round', bpat=[(0, 0, 6), (10, 7, 4)], room=2.4, seed=41),
    'forest': dict(bpm=108, key='D', prog=['D', 'Bm', 'G', 'A', 'D', 'Bm', 'Em', 'A', 'G', 'A', 'F#m', 'Bm', 'G', 'A', 'D', 'D'],
                   drums={'k': '9.......6.......', 'w': '..5...5...5..5..', 'x': '4.4.4.4.4.4.4.4.', 'b': '......7.......7.'},
                   comp=dict(inst='marimba', pat=[(0, 2, 1), (2, 2, .6), (4, 2, .8), (6, 2, .6), (8, 2, 1), (10, 2, .6), (12, 2, .8), (14, 2, .6)], gain=0.12, strum=0.0),
                   melody=dict(inst='flute', range=(69, 86), gain=0.34, density=0.75, lens=[4, 4, 2, 6, 8]), pad=dict(gain=0.06),
                   bass='pluck', bpat=[(0, 0, 4), (8, 7, 4)], seed=51),
    'coast': dict(bpm=112, key='E', swing=0.08, prog=['E', 'C#m', 'A', 'B', 'E', 'G#m', 'A', 'B', 'C#m', 'A', 'E', 'B', 'A', 'B', 'E', 'E'],
                  drums={'k': '9..6..9.........', 's': '....8.......8...', 'x': '7575757575757575', 'w': '.......5......5.'},
                  comp=dict(inst='uke', pat=[(0, 2, 1), (3, 2, .7), (6, 2, .8), (8, 2, 1), (11, 2, .7), (14, 2, .8)], gain=0.2),
                  melody=dict(inst='steel', range=(64, 83), gain=0.36, density=0.85, lens=[2, 2, 4, 4, 2, 6]),
                  bass='round', bpat=[(0, 0, 3), (6, 7, 2), (8, 0, 3), (12, 7, 3)], seed=61),
    'snow': dict(bpm=126, key='C', prog=['C', 'Am', 'F', 'G', 'C', 'Em', 'F', 'G7', 'F', 'G', 'Em', 'Am', 'Dm7', 'G7', 'C', 'C'],
                 drums={'k': '9.......9.......', 's': '....8.......8...', 'j': '5.7.5.7.5.7.5.7.'},
                 comp=dict(inst='pizz', pat=[(0, 2, 1), (4, 2, .7), (8, 2, .9), (12, 2, .7)], gain=0.25),
                 melody=dict(inst='celesta', range=(72, 88), gain=0.34, density=0.85, double='bell'), pad=dict(gain=0.07, bright=2200),
                 bass='round', bpat=[(0, 0, 3), (4, 7, 3), (8, 0, 3), (12, 7, 3)], arp=dict(inst='bell', every=2, gain=0.07), seed=71),
    'sakura': dict(bpm=96, key='D', scale='penta', prog=['D', 'Bm', 'G', 'A', 'Bm', 'G', 'Em', 'A', 'G', 'A', 'Bm', 'D', 'G', 'Em', 'A', 'D'],
                   drums={'k': '9...........6...', 'w': '....7.......7.7.', 'x': '..4...4...4...4.'},
                   comp=dict(inst='koto', pat=[(0, 4, 1), (6, 2, .6), (8, 4, .8), (14, 2, .5)], gain=0.2, strum=0.04),
                   melody=dict(inst='flute', range=(69, 86), gain=0.33, density=0.7, lens=[4, 4, 8, 2, 6]), pad=dict(gain=0.06, bright=1300),
                   bass='round', bpat=[(0, 0, 8), (8, 7, 8)], room=2.4, seed=81),
    'halloween': dict(bpm=118, key='D', scale='minor', swing=0.1, prog=['Dm', 'Bb', 'Gm', 'A7', 'Dm', 'Bb', 'Gm', 'A7', 'Gm', 'Dm', 'Bb', 'A7', 'Gm', 'A7', 'Dm', 'A7'],
                      drums={'k': '9.......9.......', 'w': '....8.......8...', 'b': '..6...6...6...6.', 'h': '5.5.5.5.5.5.5.5.'},
                      comp=dict(inst='pizz', pat=[(0, 2, 1), (2, 2, .6), (4, 2, .8), (6, 2, .6), (8, 2, 1), (10, 2, .6), (12, 2, .8), (14, 2, .6)], gain=0.17, strum=0),
                      melody=dict(inst='celesta', range=(69, 86), gain=0.34, density=0.75), bass='pluck',
                      bpat=[(0, 0, 3), (4, 7, 3), (8, 0, 3), (12, 7, 3)], pad=dict(gain=0.05, bright=900), seed=91),
    'festival': dict(bpm=130, key='F', prog=['F', 'Bb', 'C', 'F', 'Dm', 'Bb', 'C', 'C7', 'Bb', 'C', 'Am', 'Dm', 'Bb', 'C', 'F', 'F'],
                     drums={'k': '9.......9.......', 'c': '....9.......9...', 'h': '7575757575757575', 'o': '..............6.'},
                     comp=dict(inst='uke', pat=[(0, 2, 1), (2, 2, .6), (6, 2, .8), (8, 2, 1), (10, 2, .6), (14, 2, .8)], gain=0.2),
                     melody=dict(inst='brass', range=(65, 81), gain=0.33, density=0.85, double='bell', dgain=0.1),
                     bass='round', bpat=[(0, 0, 3), (4, 0, 2), (8, 7, 3), (12, 7, 2), (14, 'a', 2)], arp=dict(inst='marimba', every=2, gain=0.08), seed=101),
}


# ---------------- SFX -----------------
def sfx_all():
    out = {}
    t = lambda s: np.arange(int(SR * s)) / SR
    # coin: two quick bells
    a = fm(1568, 0.08, 3.0, 1.2, 10, 14, rel=0.05)
    b = fm(2093, 0.18, 3.0, 1.2, 8, 9, rel=0.1)
    s = np.zeros(int(SR * 0.4)); s[:len(a)] += a[:len(s)] * 0.6; o = int(0.06 * SR); s[o:o + len(b)] += b[:len(s) - o] * 0.7
    out['coin'] = s
    # jump: rising whoosh + boing
    tt = t(0.3)
    f = 300 + 500 * (tt / 0.3) ** 0.6
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9) * 0.5
    y += bp(rng.normal(0, 1, len(tt)), 800, 4000) * np.sin(np.pi * tt / 0.3) * 0.25
    out['jump'] = y
    # land: soft thump
    tt = t(0.18)
    out['land'] = (np.sin(2 * np.pi * (90 + 60 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 25) * 0.8 + lp(rng.normal(0, 1, len(tt)), 900) * np.exp(-tt * 40) * 0.4)
    # slide: swish
    tt = t(0.45)
    nz = rng.normal(0, 1, len(tt))
    out['slide'] = (lp(nz, 3000) - lp(nz, 600)) * np.sin(np.pi * tt / 0.45) ** 1.5 * 0.6
    # whoosh (lane change)
    tt = t(0.18)
    nz = rng.normal(0, 1, len(tt))
    out['swipe'] = (lp(nz, 5000) - lp(nz, 1500)) * np.sin(np.pi * tt / 0.18) ** 2 * 0.35
    # hit: thud + wobble
    tt = t(0.6)
    y = np.sin(2 * np.pi * (70 + 120 * np.exp(-tt * 20)) * tt) * np.exp(-tt * 8)
    y += lp(rng.normal(0, 1, len(tt)), 1200) * np.exp(-tt * 15) * 0.6
    y += np.sin(2 * np.pi * (420 - 200 * tt) * tt) * np.exp(-tt * 6) * 0.25 * (1 + np.sin(2 * np.pi * 14 * tt)) / 2
    out['hit'] = y
    # power-up: arpeggio
    s = np.zeros(int(SR * 0.9))
    for i, m in enumerate([72, 76, 79, 84, 88]):
        g = celesta(mtof(m), 0.25)
        o = int(i * 0.07 * SR)
        e = min(len(s), o + len(g)); s[o:e] += g[:e - o] * 0.6
    out['power'] = s
    # shield break
    tt = t(0.5)
    out['shieldbreak'] = (hp(rng.normal(0, 1, len(tt)), 3000) * np.exp(-tt * 10) * 0.5 + fm(1200, 0.3, 2.3, 4, 8, 6)[:len(tt)] * 0.4)
    # heart
    s = np.zeros(int(SR * 0.7))
    for i, m in enumerate([76, 81, 88]):
        g = bell(mtof(m), 0.3)
        o = int(i * 0.1 * SR); e = min(len(s), o + len(g)); s[o:e] += g[:e - o] * 0.7
    out['heart'] = s
    # story item: sparkle chord
    s = np.zeros(int(SR * 1.2))
    for i, m in enumerate([79, 83, 86, 91, 95]):
        g = bell(mtof(m), 0.5)
        o = int(i * 0.05 * SR); e = min(len(s), o + len(g)); s[o:e] += g[:e - o] * 0.5
    out['item'] = s
    # click
    tt = t(0.08)
    out['click'] = np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 70) * 0.5 + woodblock(0.6)[:len(tt)]
    # step
    tt = t(0.08)
    out['step'] = lp(rng.normal(0, 1, len(tt)), 700) * np.exp(-tt * 60) * 0.6
    # star / reward ding
    out['star'] = addp(bell(mtof(88), 0.6) * 0.8, bell(mtof(95), 0.6) * 0.4)
    # horn (car)
    tt = t(0.45)
    y = (saw(392, len(tt)) + saw(494, len(tt))) * env(len(tt), 0.01, 0.05, 0.9, 0.08, int(0.35 * SR))
    out['horn'] = lp(y, 1800) * 0.35
    # train horn
    tt = t(1.2)
    y = sum(saw(f, len(tt)) for f in (277, 349, 415)) * env(len(tt), 0.08, 0.1, 0.9, 0.3, int(0.85 * SR))
    out['trainhorn'] = lp(y, 1400) * 0.22
    # bleat (synthetic sheep voice)
    tt = t(0.75)
    f0 = 330 + 40 * np.sin(np.pi * tt / 0.75) - 60 * tt
    trem = 1 + 0.35 * np.sin(2 * np.pi * 17 * tt)
    ph = 2 * np.pi * np.cumsum(f0 * (1 + 0.03 * np.sin(2 * np.pi * 17 * tt))) / SR
    src = sum(np.sin(ph * k) / k ** 0.9 for k in range(1, 18))
    y = bp(src, 500, 1100) * 1.0 + bp(src, 1600, 2600) * 0.6 + bp(src, 2800, 3600) * 0.25
    y *= trem * env(len(tt), 0.04, 0.1, 0.85, 0.18, int(0.6 * SR))
    out['bleat'] = y * 1.4
    # victory jingle
    s = np.zeros(int(SR * 3.2))
    seq = [(72, 0, .15), (76, .15, .15), (79, .3, .15), (84, .45, .5), (79, .95, .15), (84, 1.1, 1.2)]
    for m, o, d in seq:
        for inst, g in ((brass, 0.45), (bell, 0.3)):
            w = inst(mtof(m), d)
            oo = int(o * SR); e = min(len(s), oo + len(w)); s[oo:e] += w[:e - oo] * g
    for m in (60, 64, 67, 72):
        w = pad(mtof(m), 1.6)
        oo = int(1.1 * SR); e = min(len(s), oo + len(w)); s[oo:e] += w[:e - oo] * 0.25
    out['victory'] = s
    # fail jingle
    s = np.zeros(int(SR * 2.2))
    for i, m in enumerate([67, 66, 65, 64]):
        w = pizz(mtof(m), 0.3) if i < 3 else celesta(mtof(m - 12), 0.9)
        oo = int(i * 0.28 * SR); e = min(len(s), oo + len(w)); s[oo:e] += w[:e - oo] * 0.7
    out['fail'] = s
    # countdown beep / go
    out['beep'] = fm(880, 0.12, 1, 0.5, 5, 10)
    out['go'] = fm(1320, 0.3, 1, 0.8, 4, 5)
    # magnet hum loop-ish pickup
    out['magnet'] = fm(440, 0.4, 0.5, 3, 3, 4) * 0.5
    return out


def write_sfx():
    for k, v in sfx_all().items():
        v = np.asarray(v, dtype=float)
        v = v / (np.max(np.abs(v)) + 1e-9) * 0.9
        # small room
        ir_t = np.arange(int(SR * 0.4)) / SR
        ir = rng.normal(0, 1, len(ir_t)) * np.exp(-ir_t * 14)
        ir /= np.sqrt(np.sum(ir ** 2))
        w = v + fftconvolve(v, ir)[:len(v)] * 0.12
        w = w / (np.max(np.abs(w)) + 1e-9) * 0.9
        fade = min(len(w), 400)
        w[-fade:] *= np.linspace(1, 0, fade)
        write('sfx_' + k, w[:, None], q=4)


if __name__ == '__main__':
    which = sys.argv[1:] or list(TRACKS) + ['sfx']
    for name in which:
        if name == 'sfx':
            write_sfx(); print('sfx ok'); continue
        st = compose(TRACKS[name])
        p = write('music_' + name, st)
        print(name, round(len(st) / SR, 1), 's', os.path.getsize(p) // 1024, 'KB', flush=True)
