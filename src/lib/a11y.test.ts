import { expect, it } from 'vitest';
import { contrastIssue, groupIssues, iconContrastIssue, isLargeText, type Instance } from './a11y';

it('grades text contrast against AA / AAA for its size', () => {
  expect(contrastIssue(3.0, false)).toMatchObject({
    severity: 'warning',
    messageKey: 'contrastAaMessage',
    params: ['3', '4.5'],
    size: 'textSizeNormal',
  });
  expect(contrastIssue(5.0, false)).toMatchObject({ severity: 'info', params: ['5', '7'] });
  expect(contrastIssue(7.5, false)).toBeNull();
  expect(contrastIssue(3.2, true)).toMatchObject({ severity: 'info', size: 'textSizeLarge' });
  expect(isLargeText(18, 400)).toBe(true);
  expect(isLargeText(14, 700)).toBe(true);
  expect(isLargeText(16, 400)).toBe(false);
});

it('flags icons of 8px+ under 3:1', () => {
  expect(iconContrastIssue(2.5, 16)).toMatchObject({ severity: 'warning', params: ['2.5', '3'] });
  expect(iconContrastIssue(2.5, 6)).toBeNull();
  expect(iconContrastIssue(3, 16)).toBeNull();
});

it('groups same verdict on the same selector, warnings first', () => {
  const inst = (elementId: string, ratio: number): Instance => ({
    elementId,
    type: 'contrast-failure',
    selector: 'span',
    verdict: contrastIssue(ratio, false)!,
    message: '',
    recommendation: '',
    metadata: {
      color: '#EEEEEE',
      backgroundColor: '#FFFFFF',
      contrastRatio: ratio,
      requiredRatio: 4.5,
    },
  });
  const out = groupIssues([inst('v-1', 5), inst('v-2', 1.2), inst('v-3', 1.2)]);
  expect(out.map((i) => [i.severity, i.elementIds])).toEqual([
    ['warning', ['v-2', 'v-3']],
    ['info', ['v-1']],
  ]);
});
