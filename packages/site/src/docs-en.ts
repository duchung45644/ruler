/** All en pages, bundled as one chunk loaded on demand by Docs.svelte. */
const files = import.meta.glob<string>('../docs/en/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export default Object.fromEntries(
  Object.entries(files).map(([path, md]) => [path.slice(path.lastIndexOf('/') + 1, -3), md]),
);
