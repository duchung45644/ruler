# stdin commands: "m x y ms" smooth move (curved, eased), "c" click, "q" quit. Prints "ok" after each.
import ctypes, sys, time, math, random, os
T0 = time.time(); SC = float(os.environ.get('SCALE', '1')); LOG = open(os.environ.get('CAMLOG', '/dev/null'), 'w', buffering=1)
X = ctypes.CDLL('libX11.so.6'); T = ctypes.CDLL('libXtst.so.6')
X.XOpenDisplay.restype = ctypes.c_void_p
d = ctypes.c_void_p(X.XOpenDisplay(None))
cur = [960.0, 540.0]
def warp(x, y):
    T.XTestFakeMotionEvent(d, -1, int(x), int(y), 0); X.XFlush(d); LOG.write(f'{time.time()-T0:.3f} m {x/SC:.1f} {y/SC:.1f}\n')
def ease(t): return 16*t**5 if t < .5 else 1-(-2*t+2)**5/2  # quintic in-out
warp(*cur)
for line in sys.stdin:
    a = line.split()
    if not a: continue
    if a[0] in ('m', 'ms'):  # ms = straight line (drags)
        x, y, ms = float(a[1]), float(a[2]), float(a[3])
        x0, y0 = cur; dx, dy = x-x0, y-y0; L = math.hypot(dx, dy) or 1
        bend = 0 if a[0] == 'ms' else min(120, L*0.18) * (1 if (int(x0+y0) % 2) else -1)  # arc
        n = max(10, int(ms/16))
        for i in range(1, n+1):
            t = ease(i/n); s = math.sin(math.pi*t)*bend
            warp(x0+dx*t - dy/L*s, y0+dy*t + dx/L*s); time.sleep(ms/1000/n)
        cur[:] = [x, y]
    elif a[0] == 'c':
        LOG.write(f'{time.time()-T0:.3f} d 0 0\n')
        T.XTestFakeButtonEvent(d, 1, 1, 0); X.XFlush(d); time.sleep(.07)
        T.XTestFakeButtonEvent(d, 1, 0, 0); X.XFlush(d)
    elif a[0] == 'k':
        X.XKeysymToKeycode.restype = ctypes.c_ubyte
        kc = X.XKeysymToKeycode(d, X.XStringToKeysym(a[1].encode()))
        T.XTestFakeKeyEvent(d, kc, 1, 0); T.XTestFakeKeyEvent(d, kc, 0, 0); X.XFlush(d)
    elif a[0] == 'K':  # chord: K Control_L a
        X.XKeysymToKeycode.restype = ctypes.c_ubyte
        kcs = [X.XKeysymToKeycode(d, X.XStringToKeysym(k.encode())) for k in a[1:]]
        for kc in kcs: T.XTestFakeKeyEvent(d, kc, 1, 0)
        for kc in reversed(kcs): T.XTestFakeKeyEvent(d, kc, 0, 0)
        X.XFlush(d)
    elif a[0] == 'w':  # wheel: w <clicks> (positive = down)
        b = 5 if int(a[1]) > 0 else 4
        for _ in range(abs(int(a[1]))):
            T.XTestFakeButtonEvent(d, b, 1, 0); T.XTestFakeButtonEvent(d, b, 0, 0); X.XFlush(d); time.sleep(0.06)
    elif a[0] in ('dn', 'up'):  # button 1 press / release (drags)
        if a[0] == 'dn': LOG.write(f'{time.time()-T0:.3f} d 0 0\n')
        T.XTestFakeButtonEvent(d, 1, 1 if a[0] == 'dn' else 0, 0); X.XFlush(d)
    elif a[0] == 'q': break
    print('ok', flush=True)
