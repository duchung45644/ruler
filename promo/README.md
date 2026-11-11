# Promo video tooling

Scripted, fully automated takes of PixelLens features (Linux/X11).

- `video/*.mjs` — one script per scene (auto=Inspect, resp, xray, overlay, palette, shot, taborder, agent, rm=Ruler/Measure/Grid).
- `video/xe.sh scene.mjs live/out.mkv` — record on a fresh 1920x1080 Xephyr (no taskbar). `REAL=1 node scene.mjs out.mkv` records the real screen.
- `video/xin.py` — XTest mouse/keyboard driver; logs moves/clicks to `out.mkv.cam`.
- `video/compose.py take.mkv plan.json out.mp4` — zoom/frame render (run only after a take is approved).
- `video/fx.py composed.mp4 take.mkv fx.json out.mp4` — captions, key badges, click ripples. Example specs in `video/fxt/`.
- `video/live/` — approved raw takes (+ .cam/.play/.start sidecars); `fx-demo.mp4` is the effects test.
- `shots/www` — Brightloom demo page (serve on 127.0.0.1:8765). `shots/ext` — built extension with `host_permissions: <all_urls>` added.

Needs: ffmpeg (scripts look in `../ffmpeg/node_modules`, `npm i ffmpeg-static` there or edit `FF`), Playwright (import path at top of each .mjs), Xephyr, python3 + Pillow.
