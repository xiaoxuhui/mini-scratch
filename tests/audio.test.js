import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAudio} from '../src/audio.js';
test('audio unlocks once, schedules envelopes and disconnects every node on stop',async()=>{
  const original=globalThis.AudioContext,created=[],gains=[];let contexts=0,changes=0;
  class Context{
    state='suspended';currentTime=2;destination={};constructor(){contexts++;}
    async resume(){this.state='running';}
    createOscillator(){const node={frequency:{value:0},connect(){},disconnect(){this.disconnected=true;},start(){this.started=true;},stop(at){if(at===undefined)this.onended();else this.endAt=at;}};created.push(node);return node;}
    createGain(){const node={gain:{setValueAtTime(){},linearRampToValueAtTime(){}},connect(){},disconnect(){this.disconnected=true;}};gains.push(node);return node;}
  }
  globalThis.AudioContext=Context;
  try{const audio=createAudio(()=>changes++);assert.throws(()=>audio.play({kind:'note'}),/尚未启用/);await audio.unlock();await audio.unlock();assert.equal(contexts,1);audio.play({kind:'note',frequency:440,seconds:0.5,volume:50});audio.play({kind:'note',frequency:220,seconds:1,volume:20});assert.equal(audio.activeCount,2);assert.equal(created[0].frequency.value,440);assert.equal(created[0].endAt,2.5);audio.stop();assert.equal(audio.activeCount,0);assert.ok(created.every(n=>n.disconnected));assert.ok(gains.every(n=>n.disconnected));assert.ok(changes>=3);}finally{if(original===undefined)delete globalThis.AudioContext;else globalThis.AudioContext=original;}
});
test('a stop while decoding cancels playback and normal recorded sources disconnect',async()=>{
  const original=globalThis.AudioContext;let resolve,created=0,disconnected=0;
  class Context{state='running';destination={};decodeAudioData(){return new Promise(r=>resolve=r);}createBufferSource(){created++;return {connect(){},start(){},disconnect(){disconnected++;},stop(){this.onended();}};}createGain(){return {gain:{value:0},connect(){},disconnect(){disconnected++;}};}}
  globalThis.AudioContext=Context;
  try{const audio=createAudio();await audio.unlock();const pending=audio.play({kind:'recording',data:'data:audio/webm;base64,YQ==',volume:80});audio.stop();resolve({duration:1});await assert.rejects(pending,{name:'AbortError'});assert.equal(created,0);const next=audio.play({kind:'recording',data:'data:audio/webm;base64,YQ==',volume:50});resolve({duration:0.75});assert.equal(await next,0.75);assert.equal(audio.activeCount,1);audio.stop();assert.equal(audio.activeCount,0);assert.equal(disconnected,2);}finally{if(original===undefined)delete globalThis.AudioContext;else globalThis.AudioContext=original;}
});
