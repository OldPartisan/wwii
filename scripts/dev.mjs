import * as esbuild from 'esbuild';

const ctx = await esbuild.context({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: 'public/assets',
  entryNames: '[name]',
  assetNames: '[name]-[hash]',
  loader: { '.woff2': 'file', '.woff': 'file', '.jpg': 'file', '.png': 'file', '.svg': 'file' },
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' },
  sourcemap: true,
  target: ['es2020'],
  logLevel: 'info',
});
await ctx.watch();
const { host, port } = await ctx.serve({ servedir: 'public', port: 5180 });
console.log(`DEV http://${host}:${port}`);
