# Extract the largest image of an Xcursor file to PNG (no deps). usage: xcur2png.py in out.png -> prints "w h xhot yhot"
import struct, sys, zlib
b = open(sys.argv[1], 'rb').read()
_, hsize, _, n = struct.unpack_from('<4sIII', b, 0); best = None
for i in range(n):
    typ, sub, pos = struct.unpack_from('<III', b, hsize + i * 12)
    if typ == 0xfffd0002:
        _, _, _, _, w, h, xh, yh, _ = struct.unpack_from('<IIIIIIIII', b, pos)
        if not best or w > best[0]: best = (w, h, xh, yh, pos + 36)
w, h, xh, yh, off = best; rows = b''
for y in range(h):
    rows += b'\0'
    for x in range(w):
        bl, g, r, a = b[off + (y * w + x) * 4: off + (y * w + x) * 4 + 4]
        if a: r, g, bl = min(255, r * 255 // a), min(255, g * 255 // a), min(255, bl * 255 // a)  # un-premultiply
        rows += bytes((r, g, bl, a))
def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d))
open(sys.argv[2], 'wb').write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(rows)) + chunk(b'IEND', b''))
print(w, h, xh, yh)
