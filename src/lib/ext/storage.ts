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

export const storage = {
  defineItem,
  getItem,
  setItem,
  removeItem: (key: string) => setItem(key, null),
};
