import { Options, defineConfig } from 'tsup';

import { peerDependencies } from './package.json';

export default defineConfig(({ watch }) => {
  const isDev = typeof watch !== 'undefined';

  return {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    clean: true,
    sourcemap: true,
    minify: !isDev,
    dts: true,
    external: [...Object.keys(peerDependencies)]
  } as Options;
});
