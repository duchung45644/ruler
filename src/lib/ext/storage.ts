import { browser } from '#imports';

/**
 * The slice of @wxt-dev/storage we use, same keys (`area:key`) and semantics:
 * a missing value reads as the fallback, writing null removes the key. Saves ~26 KB per bundle.
 */
type Area = 'local' | 'session' | 'sync';
const split = (key: string) => {
  const i = key.indexOf(':');
  return [browser.storage[key.slice(0, i) as Area], key.slice(i + 1)] as const;
};

async function getItem<T>(key: string): Promise<T | null> {
  const [area, k] = split(key);
  return ((await area.get(k))[k] as T | undefined) ?? null;
}

async function setItem(key: string, value: unknown): Promise<void> {
  const [area, k] = split(key);
  await (value == null ? area.remove(k) : area.set({ [k]: value }));
}

export interface Item<T> {
  getValue(): Promise<T>;
  setValue(value: T): Promise<void>;
  removeValue(): Promise<void>;
  /** Called on real changes only; returns the unwatch. */
  watch(cb: (value: T, old: T) => void): () => void;
}

function defineItem<T>(key: string, { fallback }: { fallback: T }): Item<T> {
  return {
    getValue: async () => (await getItem<T>(key)) ?? fallback,
    setValue: (value) => setItem(key, value),
    removeValue: () => setItem(key, null),
    watch(cb) {
      const [area, k] = split(key);
      const l = (changes: Record<string, { newValue?: unknown; oldValue?: unknown }>) => {
        const c = changes[k];
        if (!c || JSON.stringify(c.newValue) === JSON.stringify(c.oldValue)) return;
        cb((c.newValue as T) ?? fallback, (c.oldValue as T) ?? fallback);
      };
      area.onChanged.addListener(l);
      return () => area.onChanged.removeListener(l);
    },
  };
}

/** chrome.storage.sync QUOTA_BYTES_PER_ITEM: key + JSON value, in bytes. */
export const SYNC_ITEM_MAX = 8192;

/** True when `value` under `key` fits one sync item. */
export const fitsSync = (key: string, value: unknown): boolean =>
  new TextEncoder().encode(key + JSON.stringify(value)).length <= SYNC_ITEM_MAX;

/**
 * A small preference that follows the browser account: lives in storage.sync, under the same bare
 * key it used in storage.local. The first read moves an old local value over; a value too big for
 * one sync item (or a sync write the browser refuses, e.g. rate limits) stays in local instead.
 */
function defineSyncItem<T>(name: string, { fallback }: { fallback: T }): Item<T> {
  const { sync, local } = browser.storage;
  const read = async (area: Pick<typeof local, 'get'>, k = name) =>
    (await area.get(k))[k] as T | undefined;
  async function write(value: T | null): Promise<void> {
    if (value == null) {
      await Promise.all([sync.remove(name), local.remove(name)]);
      return;
    }
    try {
      if (!fitsSync(name, value)) throw new Error('too big for sync');
      await sync.set({ [name]: value });
      await local.remove(name);
    } catch {
      await local.set({ [name]: value });
      await sync.remove(name).catch(() => {});
    }
  }
  async function getValue(): Promise<T> {
    const synced = await read(sync);
    if (synced !== undefined) return synced;
    const old = await read(local);
    if (old === undefined) return fallback;
    if (fitsSync(name, old)) await write(old); // one-time migration
    return old;
  }
  return {
    getValue,
    setValue: write,
    removeValue: () => write(null),
    watch(cb) {
      // a move between areas fires two events: report the effective value once it settles
      // (reads are chained so they compare in order)
      let last = JSON.stringify(fallback);
      let queue = getValue()
        .then((v) => void (last = JSON.stringify(v)))
        .catch(() => {});
      const l = (changes: Record<string, unknown>, area: string) => {
        if ((area !== 'sync' && area !== 'local') || !(name in changes)) return;
        queue = queue
          .then(getValue)
          .then((v) => {
            const raw = JSON.stringify(v);
            const prev = last;
            last = raw;
            if (raw !== prev) cb(v, JSON.parse(prev) as T);
          })
          .catch(() => {});
      };
      browser.storage.onChanged.addListener(l);
      return () => browser.storage.onChanged.removeListener(l);
    },
  };
}

export const storage = {
  defineItem,
  defineSyncItem,
  getItem,
  setItem,
  removeItem: (key: string) => setItem(key, null),
};
