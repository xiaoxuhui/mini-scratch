import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolve, sep } from 'node:path';
import { resolveStaticPath } from '../scripts/static-path.mjs';
test('serves index and assets when root has a trailing separator',()=>{const root=resolve('dist');assert.equal(resolveStaticPath(root+sep,'/'),resolve(root,'index.html'));assert.equal(resolveStaticPath(root+sep,'/src/app.js'),resolve(root,'src/app.js'));});
test('rejects encoded traversal outside static root',()=>{assert.throws(()=>resolveStaticPath(resolve('dist'),'/..%2fpackage.json'),/Forbidden/);});
