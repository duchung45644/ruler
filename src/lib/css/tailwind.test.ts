import { describe, expect, it } from 'vitest';
import { tailwindClasses, toTailwind, toV4, V4_RENAMES } from './tailwind';

// Outputs captured by running the legacy generator (content.js:17948–19737) on each input.
const LEGACY: [string, string][] = [
  ['display: flex', 'flex'],
  ['padding: 16px', 'p-[16px]'],
  ['margin: 0px 8px', 'mx-[8px] my-[0px]'],
  ['padding: 1px 2px 3px', 'px-[2px] pt-[1px] pb-[3px]'],
  ['margin: 1px 2px 3px 4px', 'mt-[1px] mb-[3px] ml-[4px] mr-[2px]'],
  ['border-radius: 4px', 'rounded-[4px]'],
  ['box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px', 'shadow-[rgba(0,0,0,0.1)_0px_1px_2px_0px]'],
  ['opacity: 0.5', 'op-50'],
  ['color: rgb(17, 24, 39)', 'text-[rgb(17,24,39)]'],
  ['font-size: 14px', 'text-[14px]'],
  ['font-weight: 700', 'font-[weight:700]'],
  ['font-family: Inter, sans-serif', 'font-[family-name:Inter,_sans-serif]'],
  ['font-family: ui-monospace, monospace', 'font-mono'],
  ['line-height: 1.5', 'leading-normal'],
  ['letter-spacing: -0.5px', 'tracking-[-0.5px]'],
  ['text-align: center', 'text-center'],
  ['flex-direction: column', 'flex-col'],
  ['justify-content: space-between', 'justify-between'],
  ['align-items: center', 'items-center'],
  ['grid-template-columns: repeat(3, 1fr)', 'grid-cols-3'],
  ['grid-template-columns: 100px 200px', 'grid-cols-[100px_200px]'],
  ['position: absolute', 'absolute'],
  ['display: none', 'hidden'],
  ['z-index: 10', 'z-10'],
  ['z-index: 3', 'z-[3]'],
  ['border: 1px solid rgb(229, 231, 235)', 'border-[1px] border-solid border-[rgb(229,231,235)]'],
  ['transform: translate(10px, 20px)', 'translate-x-[10px] translate-y-[20px]'],
  ['transition: all 0.3s ease', 'transition-all duration-[0.3s] ease-[ease]'],
  ['background-image: linear-gradient(to right, red, blue)', 'bg-gradient-to-r from-red to-blue'],
  [
    'overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3',
    'line-clamp-3',
  ],
  ['overflow: hidden; text-overflow: ellipsis; white-space: nowrap', 'truncate'],
  [
    'display: grid; grid-template-rows: 40px 1fr; gap: 4px 8px',
    'grid grid-rows-[40px_1fr] gap-4px 8px',
  ],
];

describe('toTailwind', () => {
  it.each(LEGACY)('%s → %s', (css, classes) => {
    expect(toTailwind(css)[0]).toBe(classes);
  });

  it('reports declarations it cannot convert', () => {
    expect(toTailwind('display: flex; foo-bar: 1')).toEqual(['flex', [' foo-bar: 1']]);
  });

  it('turns px into rem when asked', () => {
    expect(toTailwind('padding: 16px', true)[0]).toBe('p-[1rem]');
  });
});

describe('toV4', () => {
  it('renames v3 classes once', () => {
    expect(toV4(['shadow', 'shadow-sm', 'rounded', 'flex-grow', 'p-2'])).toEqual([
      'shadow-sm',
      'shadow-xs',
      'rounded-sm',
      'grow',
      'p-2',
    ]);
  });

  it('has the legacy table', () => {
    expect(Object.keys(V4_RENAMES)).toHaveLength(19);
    expect(V4_RENAMES['outline-none']).toBe('outline-hidden');
  });
});

describe('tailwindClasses', () => {
  it('converts the css map in order, with v4 names', () => {
    expect(
      tailwindClasses({ display: 'flex', 'flex-grow': '1', padding: '4px 8px', color: '' }),
    ).toBe('flex grow px-[8px] py-[4px]');
  });

  it('is empty for an empty map', () => {
    expect(tailwindClasses({})).toBe('');
  });
});
