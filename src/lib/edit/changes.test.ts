import { expect, it } from 'vitest';
import { type ChangeLog, changeCount, dropRecord, recordChange, toHtmlChanges } from './changes';

const snap = (html: string) => ({ selector: 'p', cssSelector: 'body > p', html });

it('counts edits per element and keeps the first snapshot', () => {
  const log: ChangeLog = new Map();
  recordChange(log, 'a', snap('<p>1</p>'), 'text');
  recordChange(log, 'a', snap('<p>2</p>'), 'class');
  expect(changeCount(log, 'a')).toBe(2);
  expect(toHtmlChanges(log, () => snap('<p class="x">3</p>'))).toEqual([
    {
      id: 'a',
      selector: 'p',
      cssSelector: 'body > p',
      kind: 'class',
      before: '<p>1</p>',
      after: '<p class="x">3</p>',
    },
  ]);
  dropRecord(log, 'a');
  expect(changeCount(log, 'a')).toBe(0);
});

it('skips records that are back to the original', () => {
  const log: ChangeLog = new Map();
  recordChange(log, 'a', snap('<p>1</p>'), 'text');
  expect(toHtmlChanges(log, () => snap('<p>1</p>'))).toEqual([]);
});
