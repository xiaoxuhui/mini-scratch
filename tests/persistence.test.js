import {test} from 'node:test';
import assert from 'node:assert/strict';
import {example} from '../src/core.js';
import {loadProject,saveProject,PROJECT_KEY,LEGACY_KEY,LEGACY_BACKUP_KEY} from '../src/persistence.js';
function storage(seed={}){const map=new Map(Object.entries(seed));return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};}
test('upgrading keeps exact old bytes and immutable backup; rollback cannot overwrite modern project',()=>{const old=example(),bytes=JSON.stringify(old,null,2),store=storage({[LEGACY_KEY]:bytes});assert.deepEqual(loadProject(store),old);const modern=example('dance');saveProject(store,modern);assert.equal(store.getItem(LEGACY_KEY),bytes);assert.equal(store.getItem(LEGACY_BACKUP_KEY),bytes);store.setItem(LEGACY_KEY,JSON.stringify(example('hello')));assert.deepEqual(loadProject(store),modern);saveProject(store,modern);assert.equal(store.getItem(LEGACY_BACKUP_KEY),bytes);});
test('malformed modern data is reported instead of silently falling back and overwriting it',()=>{const store=storage({[PROJECT_KEY]:'{bad}',[LEGACY_KEY]:JSON.stringify(example())});assert.throws(()=>loadProject(store));assert.equal(store.getItem(PROJECT_KEY),'{bad}');});
test('invalid project and unavailable storage never report saved success',()=>{const store=storage();assert.throws(()=>saveProject(store,{version:0}));assert.equal(store.getItem(PROJECT_KEY),null);assert.throws(()=>saveProject({getItem:()=>null,setItem:()=>{throw new Error('quota');}},example()),/quota/);});
