import Images from '@lucide/svelte/icons/images';
import {
  cornerAt,
  DEFAULT_OVERLAY_PREFS,
  imageLook,
  initialPlacement,
  normalizeOverlayPrefs,
  nudgeDelta,
  resizeFromCorner,
  splitClip,
  togglePinned,
  type OverlayImage,
  type OverlayPrefs,
} from '../../../lib/tools/overlay-image';
import { overlayPrefsItem } from '../../../lib/ext/settings';
import { CURSORS } from '../../../lib/capture/capture';
import { panelToggle } from '../../../ui/mount';
import { isDragging, startDrag } from '../../core/drag';
import { ownNodes } from '../../core/events';
import { addKeyHandler } from '../../core/keys';
import { addPainter, requestPaint, scroll } from '../../core/overlay';
import { registerItem } from '../../core/registry.svelte';
import { onStop, sessionSignal } from '../../core/session';
import { state } from '../../core/state.svelte';
import { overlay } from './images.svelte';
import OverlayPanel from './OverlayPanel.svelte';
import { paintSplit, removeSplit } from './split';

/** Design overlay (3.13–3.15), port of unpacked/scripts/bd/overlay.js. Images live in the page DOM
 * so mix-blend-mode: difference blends with the page (the host is its own stacking context). */
type Entry = { o: OverlayImage; img: HTMLImageElement };
let list: Entry[] = [];
let dragCursor = false;
let prefsLoaded = false;

const live = () => state.overlayOn && !state.paused;
const nat = (img: HTMLImageElement) => ({
  width: img.naturalWidth || 1,
  height: img.naturalHeight || 1,
});

export function select(i: number): void {
  overlay.sel = i;
  requestPaint();
}

/** Edits the selected image (legacy `edit`). */
export function edit(patch: (o: OverlayImage) => Partial<OverlayImage>): void {
  const e = list[overlay.sel];
  if (!e) return;
  Object.assign(e.o, patch(e.o));
  requestPaint();
}

const savePrefs = () => void overlayPrefsItem.setValue({ ...overlay.prefs }).catch(() => {});
/** Changes made while the stored prefs are still loading: applied over them, then saved. */
let early: Partial<OverlayPrefs> | null = null;

/** Changes the tool-wide comparison prefs and remembers them. */
export function setPrefs(patch: Partial<OverlayPrefs>): void {
  Object.assign(overlay.prefs, patch);
  if (early) Object.assign(early, patch);
  else savePrefs();
  requestPaint();
}

/** Blend mode of the selected image; new images start with the last one picked. */
export function setMode(mode: OverlayImage['mode']): void {
  edit(() => ({ mode }));
  setPrefs({ mode });
}

/** Stored prefs, read once per session when the tool first opens. */
async function loadPrefs(): Promise<void> {
  if (prefsLoaded) return;
  prefsLoaded = true;
  const signal = sessionSignal();
  const mine = (early = {});
  const saved = normalizeOverlayPrefs(await overlayPrefsItem.getValue().catch(() => null));
  if (early !== mine) return; // a stop (and maybe a new session) came in between
  early = null;
  if (signal.aborted) return;
  Object.assign(overlay.prefs, saved, mine);
  if (Object.keys(mine).length) savePrefs();
  requestPaint();
}

export const togglePin = () => edit((o) => togglePinned(o, scroll()));

export function removeSelected(): void {
  const e = list[overlay.sel];
  if (!e) return;
  e.img.remove();
  ownNodes.delete(e.img);
  list.splice(overlay.sel, 1);
  overlay.images.splice(overlay.sel, 1);
  overlay.sel = Math.min(overlay.sel, list.length - 1);
  requestPaint();
}

function onPointerMove(e: PointerEvent): void {
  if (isDragging()) return;
  const img = e.currentTarget as HTMLImageElement;
  const r = img.getBoundingClientRect();
  const c = cornerAt(r, e.clientX - r.left, e.clientY - r.top);
  img.style.cursor = CURSORS[c ?? 'move'];
}

function onPointerDown(e: PointerEvent): void {
  if (e.button !== 0 || !live()) return;
  const i = list.findIndex((x) => x.img === e.currentTarget);
  if (i < 0) return;
  select(i);
  const { o, img } = list[i]!;
  const r = img.getBoundingClientRect();
  const corner = cornerAt(r, e.clientX - r.left, e.clientY - r.top);
  const start = { ...o };
  const { clientX: cx, clientY: cy } = e;
  document.documentElement.style.cursor = CURSORS[corner ?? 'move'];
  dragCursor = true;
  startDrag(
    e,
    (m) => {
      Object.assign(
        o,
        corner
          ? resizeFromCorner(start, nat(img), corner, m.clientX, m.clientY, scroll())
          : { x: start.x + m.clientX - cx, y: start.y + m.clientY - cy },
      );
      requestPaint();
    },
    undefined,
    () => {
      document.documentElement.style.cursor = ''; // any teardown: drop, blur, or aborted by a new drag
      dragCursor = false;
    },
  );
}

/** Most images kept at once; further pastes/drops are ignored. */
export const MAX_IMAGES = 5;

/** Adds an image (already decoded when `img` is given); it becomes the selected one. */
export function addImage(
  src: string,
  size: { width: number; height: number },
  img = new Image(),
): void {
  if (list.length >= MAX_IMAGES) return; // checked here so async loads finishing together can't overshoot
  img.src = src;
  img.alt = '';
  img.dataset.pixellens = '';
  const signal = sessionSignal();
  img.addEventListener('pointerdown', onPointerDown, { signal });
  img.addEventListener('pointermove', onPointerMove, { signal });
  const view = { ...scroll(), width: innerWidth, height: innerHeight };
  const o: OverlayImage = {
    src,
    ...initialPlacement(size, view),
    opacity: 50,
    mode: overlay.prefs.mode,
    visible: true,
    fixed: false,
  };
  document.documentElement.append(img);
  ownNodes.add(img);
  overlay.images.push(o);
  list.push({ o: overlay.images.at(-1)!, img }); // the proxy: edits reach the panel
  select(list.length - 1);
}

/** FileReader -> data URL, like legacy loadOverlayFile. */
export function loadFiles(files: Iterable<File> | null | undefined): void {
  // both steps are async: drop the image if the tool was turned off or the session stopped meanwhile
  const signal = sessionSignal();
  const alive = () => state.overlayOn && !signal.aborted;
  for (const f of files ?? []) {
    if (!f.type.startsWith('image/')) continue;
    const fr = new FileReader();
    fr.onload = () => {
      if (!alive()) return;
      const src = String(fr.result);
      const img = new Image();
      img.onload = () => {
        img.onload = null; // addImage reassigns src, which would fire onload again (endless images)
        if (alive()) addImage(src, { width: img.naturalWidth, height: img.naturalHeight }, img);
      };
      img.src = src;
    };
    fr.readAsDataURL(f);
  }
}

/** The divider's viewport x while the split is shown, else null. */
function dividerX(): number | null {
  const { split, splitPos } = overlay.prefs;
  return live() && split && list.some((e) => e.o.visible) ? (splitPos / 100) * innerWidth : null;
}

/** Legacy positionOverlay :115, plus blend looks and the split clip. Reads first, then writes. */
function position(): void {
  const many = list.length > 1;
  const divider = dividerX();
  const { onionTint, designLeft } = overlay.prefs;
  const sx = scrollX;
  const sy = scrollY;
  list.forEach(({ o, img }, i) => {
    if (!live() || !o.visible) {
      img.style.display = 'none';
      return;
    }
    if (!img.isConnected) document.documentElement.append(img);
    const left = o.fixed ? o.x : o.x - sx;
    const top = o.fixed ? o.y : o.y - sy;
    const w = img.naturalWidth ? (img.naturalWidth * o.scale) / 100 : 0;
    const look = imageLook(o, onionTint);
    const shadow =
      look.blend === 'difference' || divider !== null
        ? 'none'
        : '0 4px 24px rgba(0,0,0,.35), 0 1px 3px rgba(0,0,0,.25)';
    const outline = many && i === overlay.sel ? '2px solid #5B5BF0' : 'none';
    const cursor = img.style.cursor || 'move';
    const clip = divider === null ? 'none' : splitClip(left, w, divider, designLeft);
    img.style.cssText = `all:initial;position:fixed;left:${left}px;top:${top}px;z-index:2147483646;pointer-events:auto;cursor:${cursor};width:${w ? `${w}px` : 'auto'};max-width:none;box-shadow:${shadow};outline:${outline};opacity:${look.opacity};mix-blend-mode:${look.blend};filter:${look.filter};clip-path:${clip};display:block;`;
  });
  if (divider === null) removeSplit();
  else paintSplit(divider, savePrefs);
}

const showPanel = panelToggle(OverlayPanel);

export function setOn(next: boolean): void {
  state.overlayOn = next;
  if (next) void loadPrefs();
  showPanel(next);
  requestPaint();
}

export function initOverlay(): void {
  registerItem({
    id: 'overlay',
    forward: true,
    icon: Images,
    label: 'dock.overlay',
    key: 'o',
    run: () => setOn(!state.overlayOn),
    isActive: () => state.overlayOn,
  });
  const signal = sessionSignal();
  window.addEventListener(
    'paste',
    (e) => {
      if (!live()) return;
      const files = [...(e.clipboardData?.files ?? [])].filter((f) => f.type.startsWith('image/'));
      if (!files.length) return;
      e.preventDefault();
      loadFiles(files);
    },
    { capture: true, signal },
  );
  onStop(
    addKeyHandler((e) => {
      const d = state.overlayOn && list[overlay.sel] && nudgeDelta(e);
      if (!d) return false;
      edit((o) => ({ x: o.x + d.dx, y: o.y + d.dy }));
      return true;
    }),
  );
  onStop(() => {
    setOn(false);
    for (const { img } of list) {
      img.remove();
      ownNodes.delete(img);
    }
    list = [];
    overlay.images = [];
    overlay.sel = -1;
    removeSplit();
    prefsLoaded = false;
    early = null;
    overlay.prefs = { ...DEFAULT_OVERLAY_PREFS };
    if (dragCursor) document.documentElement.style.cursor = '';
    dragCursor = false;
  });
  addPainter('overlay', () => {
    position();
  });
}
