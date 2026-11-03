/** Bounded undo/redo stack for the HTML editor (port of content.js:14812–14949). */

export interface Action {
  /** Each returns the element to select afterwards. */
  undo(): Element | null;
  redo(): Element | null;
  elementIds: string[];
  coalesceKey?: string;
  at: number;
}

export class History {
  private done: Action[] = [];
  private undone: Action[] = [];

  constructor(private readonly max = 50) {}

  push(a: Action): void {
    this.done.push(a);
    if (this.done.length > this.max) this.done.shift();
    this.undone = [];
  }

  undo(): Action | null {
    const a = this.done.pop();
    if (!a) return null;
    this.undone.push(a);
    return a;
  }

  redo(): Action | null {
    const a = this.undone.pop();
    if (!a) return null;
    this.done.push(a);
    return a;
  }

  state(): { canUndo: boolean; canRedo: boolean } {
    return { canUndo: this.done.length > 0, canRedo: this.undone.length > 0 };
  }

  clear(): void {
    this.done = [];
    this.undone = [];
  }

  /** Last action when it has the same key and is recent enough to merge into (5.14). */
  coalesce(key: string, at: number, windowMs = 600): Action | null {
    const last = this.done.at(-1);
    if (!last || this.undone.length || last.coalesceKey !== key || at - last.at > windowMs)
      return null;
    return last;
  }
}
