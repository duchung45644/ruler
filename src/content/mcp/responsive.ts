/**
 * Responsive commands (10.13, legacy content.js:22858–23308) and the screenshot for AI (10.14).
 * They run in the top page only; a responsive frame refuses them (10.16).
 */
import { ERR } from '../../lib/mcp/protocol';
import { clampSize, nextId, MAX_VIEWPORTS, type Viewport } from '../../lib/responsive/viewports';
import { ZOOM_MAX, ZOOM_MIN } from '../../lib/responsive/zoom';
import { sendToBackground } from '../../lib/ext/messaging';
import { runItem } from '../core/keys';
import { state } from '../core/state.svelte';
import {
  describeViewports,
  enterResponsive,
  exitResponsive,
  setBreakpointMode,
  setViewportList,
  setZoom,
  shell,
} from '../responsive/shell.svelte';
import { withHiddenUi } from '../tools/capture/session';
import { fail, type Commands } from './command';

const DEFAULT_SIZE = { width: 390, height: 844 };
const vps = (): Viewport[] => shell.frames.map((f) => ({ ...f.vp }));
const described = () => ({ success: true, ...describeViewports() });

function responsiveOnly(): void {
  if (!state.responsiveOn) fail(ERR.notResponsive);
}
function editableSet(): void {
  responsiveOnly();
  if (shell.breakpointMode) fail(ERR.breakpointsMode);
}
/** Size floor 200×300 (drag minimum, 10.13), ceiling 3840. */
const size = (w: number, h: number) => clampSize(w, h, 'drag');

export const responsiveCommands: Commands = {
  async enter_responsive_mode() {
    if (state.responsiveOn) return { ...described(), alreadyActive: true };
    if (!(await enterResponsive())) return fail('Responsive mode could not start on this page.');
    return described();
  },
  async exit_responsive_mode() {
    if (!state.responsiveOn) return { success: true, alreadyExited: true };
    await exitResponsive(); // may navigate: the background waits for the reload (10.02)
    return { success: true, exited: !state.responsiveOn };
  },
  set_viewport({ width, height, viewportId }) {
    responsiveOnly();
    const list = vps();
    if (viewportId !== undefined) {
      const vp = list.find((v) => v.id === viewportId);
      if (!vp) return fail(`No viewport with id ${viewportId}.`);
      Object.assign(vp, size(width, height), { name: '' });
      delete vp.device;
    } else {
      editableSet();
      if (!list.length) return fail('No viewport to resize.');
      Object.assign(list[0]!, size(width, height), { name: '' });
      delete list[0]!.device;
    }
    setViewportList(list);
    return described();
  },
  get_viewport() {
    const first = state.responsiveOn ? shell.frames[0]?.vp : undefined;
    return {
      success: true,
      width: first?.width ?? innerWidth,
      height: first?.height ?? innerHeight,
      ...describeViewports(),
    };
  },
  set_viewports({ viewports }) {
    editableSet();
    const next: Viewport[] = viewports.slice(0, MAX_VIEWPORTS).map((v, i) => ({
      id: i + 1,
      name: v.name ?? '',
      ...size(v.width, v.height),
      scheme: 'system',
    }));
    setViewportList(next);
    return described();
  },
  add_viewport({ width, height, name }) {
    editableSet();
    const list = vps();
    if (list.length >= MAX_VIEWPORTS) return fail(`At most ${MAX_VIEWPORTS} viewports.`);
    list.push({
      id: nextId(list),
      name: name ?? '',
      ...size(width ?? DEFAULT_SIZE.width, height ?? DEFAULT_SIZE.height),
      scheme: 'system',
    });
    setViewportList(list);
    return described();
  },
  remove_viewport({ viewportId }) {
    editableSet();
    const list = vps();
    if (!list.some((v) => v.id === viewportId)) return fail(`No viewport with id ${viewportId}.`);
    if (list.length === 1) return fail('Cannot remove the last viewport.');
    setViewportList(list.filter((v) => v.id !== viewportId));
    return described();
  },
  set_zoom({ zoom }) {
    responsiveOnly();
    if (!(zoom > 0)) return fail(`set_zoom requires a scale between ${ZOOM_MIN} and ${ZOOM_MAX}.`);
    setZoom(zoom); // clamped 0.25–2
    return described();
  },
  set_breakpoints_mode({ enabled }) {
    responsiveOnly();
    if (enabled === shell.breakpointMode) return described();
    // the B key's own path: the breakpoints tool and its frames stay in step
    runItem('breakpoints');
    if (shell.breakpointMode !== enabled) {
      if (!enabled) setBreakpointMode(false);
      else return fail(ERR.noBreakpoints);
    }
    return described();
  },
  /**
   * Hide every iodob UI for one settled frame, grab the visible tab (frames included when
   * responsive), show it again — also when the grab fails.
   */
  async get_screenshot() {
    const r = await withHiddenUi(() => sendToBackground('capture_for_ai')).catch(() => null);
    if (!r) return fail('capture_failed');
    if (!r.ok) return fail(r.reason);
    return { dataUrl: r.dataUrl, width: r.width, height: r.height, mimeType: 'image/png' };
  },
};
