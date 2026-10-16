import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
await mkdir('work/tests',{recursive:true});
await build({entryPoints:['tests/core.test.ts'],outfile:'work/tests/core.test.mjs',bundle:true,platform:'node',format:'esm'});
await import('../work/tests/core.test.mjs');
