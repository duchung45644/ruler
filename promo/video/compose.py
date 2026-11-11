# Build camera (sendcmd) for a screen take: crop browser chrome, frame in a rounded window, auto zoom/follow.
# usage: compose.py take.mkv zoomplan.json out.mp4
import json, math, subprocess, sys, os
take, plan_f, out = sys.argv[1:4]
FF = subprocess.check_output("find ../ffmpeg/node_modules -name ffmpeg -type f | head -1", shell=True, cwd=os.path.dirname(__file__) or '.', text=True).strip()
FF = os.path.join(os.path.dirname(os.path.abspath(__file__)), FF)
off = float(open(take + '.play').read()) - float(open(take + '.start').read())
cam = [l.split() for l in open(take + '.cam')]
moves = [(float(t) + off, float(x), float(y)) for t, k, x, y in cam if k == 'm']
plan = json.load(open(plan_f))  # {"top":95,"bottom":1044,"end":21.0,"z":[[t,z],...]}
TOP, BOT, END = plan['top'], plan['bottom'], plan['end']
CHROME, CUT = plan.get('chrome', 0), plan.get('cut_after', -1)
CW, CH = 1920, BOT - TOP
S = min(1760 / CW, 940 / CH); WW, WH = round(CW * S) // 2 * 2, round(CH * S) // 2 * 2
X0, Y0 = (1920 - WW) // 2, (1080 - WH) // 2
def ease(u): return u * u * u * (u * (u * 6 - 15) + 10)  # smootherstep
def zoom(t):
    k = plan['z']
    if t <= k[0][0]: return k[0][1]
    for p, q in zip(k, k[1:]):
        a, za, b, zb = p[0], p[1], q[0], q[1]
        if t <= b: return za + (zb - za) * ease((t - a) / (b - a))
    return k[-1][1]
def cursor(t):
    p = moves[0]
    for m in moves:
        if m[0] > t: break
        p = m
    return X0 + p[1] * S, Y0 + (p[2] - TOP) * S
FPS = 30; n = int(END * FPS)
clicks = []
for t, k, x, y in cam:
    if k == 'd':
        tv = float(t) + off
        if tv < END and (not clicks or tv - clicks[-1][0] > 0.3): clicks.append((tv, *cursor(tv)))
# shot-based camera: each keyframe holds a fixed centre = mean cursor position until the next keyframe
K = plan['z']
def mean_cursor(a, b):
    pts = [cursor(a + (b - a) * i / 20) for i in range(21)]
    return sum(p[0] for p in pts) / 21, sum(p[1] for p in pts) / 21
cent = []
for i, kf in enumerate(K):
    t, z = kf[0], kf[1]
    nt = K[i + 1][0] if i + 1 < len(K) else END
    if i + 1 < len(K) and K[i + 1][1] == z and len(K[i + 1]) == 2: nt = K[i + 2][0] if i + 2 < len(K) else END  # hold spans both keys
    if len(kf) > 2: cent.append((X0 + kf[2] * S, Y0 + (kf[3] - TOP) * S))  # explicit centre (screen coords)
    else: cent.append(mean_cursor(t, max(t + 0.1, nt)) if z > 1.01 else (960, 540))
for i in range(1, len(K)):  # a hold pair shares one centre
    if K[i][1] == K[i - 1][1] and len(K[i]) == 2: cent[i] = cent[i - 1]
def camc(t):
    if t <= K[0][0]: return cent[0]
    for i in range(len(K) - 1):
        if t <= K[i + 1][0]:
            u = ease((t - K[i][0]) / (K[i + 1][0] - K[i][0]))
            return cent[i][0] + (cent[i + 1][0] - cent[i][0]) * u, cent[i][1] + (cent[i + 1][1] - cent[i][1]) * u
    return cent[-1]
keys = []; raw = []
for i in range(n + 1):
    t = i / FPS; z = zoom(t); px, py = camc(t)
    w, h = 1920 / z, 1080 / z
    ymin = (Y0 + CHROME * S) * ease(min(1, max(0, (t - CUT + 0.5) / 1.0))) if CHROME else 0
    x = min(max(px - w / 2, 0), 1920 - w); y = min(max(py - h / 2, ymin), 1080 - h)
    raw.append((t, w, x, y))
# Gaussian smoothing of the whole camera path (convex average keeps it inside the frame)
SIG = 5; ker = [math.exp(-(j / SIG) ** 2 / 2) for j in range(-3 * SIG, 3 * SIG + 1)]
for i in range(len(raw)):
    acc = [0, 0, 0]; ws = 0
    for j, kv in enumerate(ker):
        r = raw[min(max(i + j - 3 * SIG, 0), len(raw) - 1)]; ws += kv
        for c in range(3): acc[c] += r[c + 1] * kv
    if i % 2 == 0 or i == len(raw) - 1: keys.append((raw[i][0], *(a / ws for a in acc)))
json.dump(keys, open(take + '.keys', 'w'))
def pw(j, rows=None, var='in', k=1.0):  # piecewise-linear expression of column j over frame index
    rows = rows or keys
    parts = [f"if(gte({var},{round(a[0]*FPS)})*lt({var},{round(b[0]*FPS)}),{a[j]*k:.2f}+({(b[j]-a[j])*k:.2f})*({var}-{round(a[0]*FPS)})*{1/round((b[0]-a[0])*FPS):.4f},0)" for a, b in zip(rows, rows[1:])]
    return '+'.join(parts)
IS = plan.get('scale', 1)          # input pixels per CSS px (2 for the 4K take)
KK = plan.get('canvas', IS)         # canvas pixels per output px (render big, downscale = crisp zoom)
CWp, CHp = round(1920 * KK), round(1080 * KK)
R = round(18 * KK); tmp = take + '.'; Wk, Hk = round(WW * KK) // 2 * 2, round(WH * KK) // 2 * 2
subprocess.run([FF, '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', f"color=black:s={Wk}x{Hk},format=gray,geq=lum='if(gt(abs(X-{Wk}/2),{Wk}/2-{R})*gt(abs(Y-{Hk}/2),{Hk}/2-{R}),if(lte(hypot(abs(X-{Wk}/2)-({Wk}/2-{R}),abs(Y-{Hk}/2)-({Hk}/2-{R})),{R}),255,0),255)'", '-frames:v', '1', tmp + 'mask.png'], check=True)
subprocess.run([FF, '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', f"gradients=s={CWp}x{CHp}:c0=0x0f3d3a:c1=0x0b1120:x0=0:y0=0:x1={CWp}:y1={CHp},format=rgba[g];color=black:s={Wk}x{Hk},format=rgba,colorchannelmixer=aa=0.55,pad={CWp}:{CHp}:{round(X0*KK)}:{round((Y0+14)*KK)}:color=black@0,boxblur={round(26*KK)}:2[sh];[g][sh]overlay", '-frames:v', '1', tmp + 'bg.png'], check=True)
X, Y, Wd = f'({pw(2, k=KK)})', f'({pw(3, k=KK)})', f'({pw(1, k=KK)})'; Hd = f'({Wd}*0.5625)'
# drawn cursor (Adwaita, 96px, hotspot 12,4) — only when the take was captured without the system pointer
CUR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cursor.png'); CS = 0.30 * KK * S * IS  # ≈ 26px at 1x
cur_rows = [(i / FPS, *cursor(i / FPS)) for i in range(0, n + 1, 1)]
cx = pw(1, cur_rows, 'n', KK); cy = pw(2, cur_rows, 'n', KK)
cur_g = (f"[3:v]scale={round(96*CS)}:-1:flags=lanczos,format=rgba[cur];[c0][cur]overlay=x='{cx}-{12*CS:.1f}':y='{cy}-{4*CS:.1f}':eval=frame[c1];"
         if plan.get('cursor') else "[c0]null[c1];")
g = (f"[0:v]crop={round(1920*IS)}:{round(CH*IS)}:0:{round(TOP*IS)},scale={Wk}:{Hk}:flags=lanczos,format=rgba[w];[2:v]format=gray[m];[w][m]alphamerge[win];"
     f"[1:v][win]overlay={round(X0*KK)}:{round(Y0*KK)}:shortest=1,fps={FPS}[c0];{cur_g}[c1]format=yuv444p,"
     f"perspective=x0='{X}':y0='{Y}':x1='{X}+{Wd}':y1='{Y}':x2='{X}':y2='{Y}+{Hd}':x3='{X}+{Wd}':y3='{Y}+{Hd}':interpolation=cubic:eval=frame,"
     + (f"scale=1920:1080:flags=lanczos," if plan.get("out") != "4k" else "") + "format=yuv420p[v]")
open(tmp + 'graph', 'w').write(g)
subprocess.run([FF, '-y', '-loglevel', 'error', '-stats', '-i', take, '-loop', '1', '-i', tmp + 'bg.png', '-loop', '1', '-i', tmp + 'mask.png', '-loop', '1', '-i', CUR,
                '-filter_complex_script', tmp + 'graph', '-map', '[v]', '-t', str(END),
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-movflags', '+faststart', out], check=True)
