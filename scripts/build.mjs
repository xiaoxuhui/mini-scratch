import { mkdir, copyFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
await mkdir(new URL('dist/src/', root), { recursive:true });
await copyFile(new URL('index.html',root),new URL('dist/index.html',root));
for(const file of await readdir(new URL('src/',root))) await copyFile(new URL('src/'+file,root),new URL('dist/src/'+file,root));
console.log('Build complete: '+fileURLToPath(new URL('dist/',root)));
