import {test} from 'node:test';
import assert from 'node:assert/strict';
import {block,expression,createRuntime,validateProject,example} from '../src/core.js';
const fast={pace:0,sleep:async()=>{}};
test('live state reporters feed arithmetic and numeric procedure arguments, scopes survive nested calls',async()=>{
  const p=example();const a=block('define',{name:'外层',parameters:[{id:'n',name:'步数',type:'number'},{id:'s',name:'文字',type:'string'},{id:'b',name:'通过',type:'boolean'}],children:[]});delete a.parameter;
  const ref=id=>expression('parameter',{definitionId:a.id,parameterId:id});
  const inner=block('define',{name:'内层',parameters:[{id:'n',name:'值',type:'number'}],children:[block('setSize',{value:120})]});delete inner.parameter;
  a.children=[block('call',{name:'内层',arguments:[{parameterId:'n',value:5}]}),block('if',{condition:ref('b'),children:[block('move',{value:expression('add',{a:ref('n'),b:expression('spriteSize')})})],otherwise:[]}),block('say',{value:ref('s')})];
  const call=block('call',{name:a.name,arguments:[{parameterId:'n',value:expression('add',{a:expression('xPosition'),b:expression('yPosition')})},{parameterId:'s',value:123},{parameterId:'b',value:'true'}]});
  p.variables=[{name:'状态合计',value:0}];p.blocks=[a,inner,block('goto',{x:10,y:20}),block('point',{value:30}),block('setVolume',{value:42}),block('setVar',{name:'状态合计',value:expression('add',{a:expression('volume'),b:expression('add',{a:expression('direction'),b:expression('add',{a:expression('costumeNumber'),b:expression('backdropNumber')})})})}),block('point',{value:0}),call];
  const r=createRuntime(validateProject(p),fast);await r.start();await r.drain();assert.equal(r.state.x,160);assert.equal(r.state.speech,'123');assert.equal(r.state.variables.get('状态合计'),74);
});
test('parameter from another definition cannot read outer scope accidentally',async()=>{const d=block('define',{name:'a',parameters:[],children:[block('say',{value:expression('parameter',{definitionId:'other',parameterId:'n'})})]});delete d.parameter;const r=createRuntime({blocks:[d,block('call',{name:'a',arguments:[]})]},fast);await assert.rejects(r.start(),/所属/);});
test('recorded clip playback uses decoded duration and a stop during decode prevents later instructions',async()=>{let resume;const controller=new AbortController(),sounds=[];const r=createRuntime({assets:{sounds:[{id:'asset-a',data:'test',seconds:1}]},blocks:[block('playSound',{sound:'asset-a'}),block('move')]},{...fast,signal:controller.signal,onSound:e=>{sounds.push(e.kind);if(e.kind==='recording')return new Promise(r=>resume=r);}});const job=r.start();await Promise.resolve();await Promise.resolve();controller.abort();resume(0.5);await assert.rejects(job,/停止/);assert.equal(r.state.x,0);assert.deepEqual(sounds,['recording','stop']);});
