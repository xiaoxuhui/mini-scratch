import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('package, visible version and changelog agree',()=>{const root=new URL('../',import.meta.url),pkg=JSON.parse(readFileSync(new URL('package.json',root),'utf8')),html=readFileSync(new URL('index.html',root),'utf8'),log=readFileSync(new URL('CHANGELOG.md',root),'utf8');assert.ok(html.includes('v'+pkg.version+' 简易版'));assert.ok(log.includes('## '+pkg.version+' —'));});
