import type { ElementDetails } from '../../../lib/element/types';

/** Hand-built details for tests and the visual check. */
export function sampleElement(patch: Partial<ElementDetails> = {}): ElementDetails {
  const zero = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    id: 'v-1',
    name: 'p.lead',
    parentName: 'div.card',
    parentSelectable: true,
    childName: 'strong',
    type: 'text',
    selector: 'main > div.card > p.lead',
    boxModel: {
      width: 100,
      height: 20.25,
      contentWidth: 84,
      contentHeight: 12.25,
      margin: { ...zero, top: 8 },
      border: zero,
      padding: { top: 4, right: 8, bottom: 4, left: 8 },
    },
    colors: { text: ['#1F2937'], backgrounds: ['#FFFFFF', '#6366F1CC'], borders: ['#E5E7EB'] },
    gradients: [
      {
        type: 'linear-gradient',
        angle: 90,
        shape: null,
        stops: [
          { color: '#6366F1', position: 0, unit: '%' },
          { color: '#EC4899', position: 100, unit: '%' },
        ],
        raw: 'linear-gradient(90deg, rgb(99, 102, 241) 0%, rgb(236, 72, 153) 100%)',
      },
    ],
    textContent: 'The quick brown fox jumps over the lazy dog.',
    assets: [
      {
        type: 'svg',
        content:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#6366f1"/></svg>',
        renderedWidth: 40,
        renderedHeight: 40,
      },
      {
        type: 'data-image',
        dataUrl: 'data:image/png;base64,iVBORw0KGgo=',
        fileExtension: 'png',
        renderedWidth: 160,
        renderedHeight: 90,
      },
    ],
    animations: [
      {
        name: 'fade-in',
        duration: '0.3s',
        timingFunction: 'ease-out',
        delay: '0s',
        iterationCount: '1',
        keyframes: [
          { offset: 0, opacity: '0' },
          { offset: 1, opacity: '1' },
        ],
      },
    ],
    transitions: [
      {
        property: 'color',
        duration: '0.2s',
        timingFunction: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
        delay: '0s',
      },
      { property: 'opacity', duration: '1s', timingFunction: 'steps(4, end)', delay: '0.1s' },
    ],
    boxShadow: [
      {
        inset: false,
        x: '0px',
        y: '4px',
        blur: '12px',
        spread: '0px',
        color: '#0000001A',
        raw: 'rgba(0, 0, 0, 0.1) 0px 4px 12px 0px',
      },
    ],
    typography: [
      {
        fontFamily: 'Inter',
        fontStack: 'Inter, sans-serif',
        fontSize: '16px',
        fontWeight: '400',
        letterSpacing: null,
        textTransform: null,
        typographyKey: 'Inter|16px|400||',
        usage: 3,
      },
      {
        fontFamily: 'Inter',
        fontStack: 'Inter, sans-serif',
        fontSize: '12px',
        fontWeight: '600',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        typographyKey: 'Inter|12px|600|0.5px|uppercase',
        usage: 1,
      },
    ],
    issues: [
      {
        id: 'i-1',
        type: 'contrast-failure',
        category: 'accessibility',
        severity: 'warning',
        selector: 'p.lead > span.muted',
        message: 'Text has insufficient contrast ratio of 2.8:1 (requires 4.5:1 for normal text)',
        recommendation: 'Increase contrast to at least 4.5:1 for WCAG AA compliance',
        elementIds: ['v-11', 'v-12'],
        metadata: {
          color: '#9CA3AF',
          backgroundColor: '#FFFFFF',
          contrastRatio: 2.8,
          requiredRatio: 4.5,
        },
      },
    ],
    canvas: null,
    layout: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      alignContent: 'normal',
      gap: '8px',
    },
    css: { display: 'flex', padding: '4px 8px', 'font-size': '16px', color: 'rgb(31, 41, 55)' },
    after: { content: '"→"', color: 'rgb(99, 102, 241)' },
    skippedCrossOriginCount: 0,
    ...patch,
  };
}
