# Overlay pass on a composed clip: captions, key badges, click ripples (camera-aware via .keys).
# usage: fx.py composed.mp4 take.mkv spec.json out.mp4
import json, subprocess, sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
src, take, spec_f, out = sys.argv[1:5]
H = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(H, subprocess.check_output("find ../ffmpeg/node_modules -name ffmpeg -type f|head -1", shell=True, cwd=H, text=True).strip())
spec = json.load(open(spec_f)); tmp = out + '.'
FONT = '/usr/share/fonts/truetype/ubuntu/UbuntuSans[wdth,wght].ttf'
def font(sz, w='Bold'):
    f = ImageFont.truetype(FONT, sz)
    try: f.set_variation_by_name(w)
    except Exception: pass
    return f
def pill(path, parts, sz=34, pad=18):  # parts: [(text, kind)] kind 'key' | 'txt'
    f = font(sz, 'SemiBold'); gap = 12; items = []
    for t, k in parts:
        w = f.getbbox(t)[2] - f.getbbox(t)[0]; items.append((t, k, w + (36 if k == 'key' else 0)))
    W = sum(i[2] for i in items) + gap * (len(items) - 1) + pad * 2; Hh = sz + 44
    S = 30; img = Image.new('RGBA', (W + S * 2, Hh + S * 2), (0, 0, 0, 0))
    sh = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([S, S + 8, S + W, S + Hh + 8], 22, fill=(0, 0, 0, 140))
    img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(14))); d = ImageDraw.Draw(img)
    d.rounded_rectangle([S, S, S + W, S + Hh], 22, fill=(17, 20, 27, 235), outline=(255, 255, 255, 40), width=2)
    x = S + pad; cy = S + Hh / 2
    for t, k, w in items:
        if k == 'key':
            d.rounded_rectangle([x, cy - sz / 2 - 10, x + w, cy + sz / 2 + 12], 12, fill=(44, 50, 64, 255))
            d.rounded_rectangle([x, cy - sz / 2 - 10, x + w, cy + sz / 2 + 6], 12, fill=(64, 72, 90, 255))
            d.text((x + w / 2, cy - 2), t, font=f, fill=(240, 243, 248), anchor='mm')
        else: d.text((x + w / 2, cy), t, font=f, fill=(160, 168, 184), anchor='mm')
        x += w + gap
    img.save(path); return img.size
def caption(path, title, sub):
    ft, fs = font(50, 'Bold'), font(26, 'Medium')
    W = max(ft.getbbox(title)[2], fs.getbbox(sub)[2]) + 84; Hh = 136; P = 30
    img = Image.new('RGBA', (W + P * 2, Hh + P * 2), (0, 0, 0, 0))
    sh = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([P, P + 10, P + W, P + Hh + 10], 24, fill=(0, 0, 0, 120))
    img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(16))); d = ImageDraw.Draw(img)
    d.rounded_rectangle([P, P, P + W, P + Hh], 24, fill=(15, 18, 26, 238), outline=(255, 255, 255, 36), width=2)
    d.rounded_rectangle([P + 24, P + 26, P + 30, P + Hh - 26], 3, fill=(45, 212, 191))
    d.text((P + 48, P + 22), title, font=ft, fill=(255, 255, 255)); d.text((P + 49, P + 84), sub, font=fs, fill=(170, 180, 198))
    img.save(path); return img.size
keys = json.load(open(take + '.keys'))  # (t, w, x, y) camera window, canvas px
def cam(t):
    k = min(keys, key=lambda r: abs(r[0] - t)); return k
plan = json.load(open(spec['plan'])); TOP, BOT = plan['top'], plan['bottom']; CH = BOT - TOP
S = min(1760 / 1920, 940 / CH); WW, WH = round(1920 * S) // 2 * 2, round(CH * S) // 2 * 2; X0, Y0 = (1920 - WW) // 2, (1080 - WH) // 2
inputs, chain, last, n = [], [], '0:v', 1
def add(png_or_mov, t0, dur, x, y, slide=0, loop=True, scale=None):
    global last, n
    inputs.extend((['-loop', '1', '-t', f'{dur:.2f}'] if loop else []) + ['-i', png_or_mov])
    f = f"[{n}:v]format=rgba," + (f"scale={scale}:-1," if scale else "") + (f"fade=in:st=0:d=0.3:alpha=1,fade=out:st={dur-0.3:.2f}:d=0.3:alpha=1," if loop else "") + f"setpts=PTS+{t0}/TB[o{n}]"
    yx = f"{y}+{slide}*pow(max(0\\,1-(t-{t0})/0.35)\\,3)" if slide else str(y)
    chain.append(f); chain.append(f"[{last}][o{n}]overlay=x={x}:y='{yx}':eof_action=pass[v{n}]"); last = f'v{n}'; n += 1
for i, c in enumerate(spec.get('captions', [])):
    w, h = caption(tmp + f'cap{i}.png', c['title'], c['sub']); add(tmp + f'cap{i}.png', c['t'], c['dur'], 40, 30, slide=30)
for i, k in enumerate(spec.get('keys', [])):
    w, h = pill(tmp + f'key{i}.png', [(p, 'txt' if p in ('+', 'then') else 'key') for p in k['k']])
    add(tmp + f'key{i}.png', k['t'], k['dur'], (1920 - w) // 2, 1080 - h - 30, slide=24)
off = float(open(take + '.play').read()) - float(open(take + '.start').read())
cl = [l.split() for l in open(take + '.cam')]; mv = None
for t, kd, x, y in cl:
    if kd == 'm': mv = (float(x), float(y))
    if kd == 'd':
        tc = float(t) + off; _, w, cx, cy = cam(tc); z = 1920 / w
        sx, sy = X0 + mv[0] * S, Y0 + (mv[1] - TOP) * S; ox, oy = (sx - cx) * z, (sy - cy) * z
        sz = round(110 * z * 0.9) // 2 * 2; add(os.path.join(H, 'ripple.mov'), round(tc, 2), 0.5, round(ox - sz / 2), round(oy - sz / 2), loop=False, scale=sz)
open(tmp + 'graph', 'w').write(';'.join(chain) + f";[{last}]format=yuv420p[out]")
subprocess.run([FF, '-y', '-loglevel', 'error', '-i', src, *inputs, '-filter_complex_script', tmp + 'graph', '-map', '[out]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', out], check=True)
