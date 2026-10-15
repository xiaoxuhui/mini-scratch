export function createAudio(){
  let context=null;const active=new Set();
  async function unlock(){const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)throw new Error('当前浏览器不支持声音合成');if(!context)context=new Audio();if(context.state==='suspended')await context.resume();if(context.state!=='running')throw new Error('声音尚未启用，请再次点击绿旗');}
  function stop(){for(const oscillator of active){try{oscillator.stop();}catch{/* Oscillator may already have ended. */}}active.clear();}
  function play(event){
    if(event.kind==='stop'){stop();return;}
    if(!context||context.state!=='running')throw new Error('声音尚未启用，请点击绿旗重试');
    const oscillator=context.createOscillator(),gain=context.createGain(),now=context.currentTime;
    oscillator.type='sine';oscillator.frequency.value=event.frequency;
    gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(event.volume/100*0.18,now+0.01);gain.gain.setValueAtTime(event.volume/100*0.18,now+Math.max(0.01,event.seconds-0.02));gain.gain.linearRampToValueAtTime(0,now+event.seconds);
    oscillator.connect(gain);gain.connect(context.destination);active.add(oscillator);
    oscillator.onended=()=>{active.delete(oscillator);oscillator.disconnect();gain.disconnect();};oscillator.start();oscillator.stop(now+event.seconds);
  }
  return {unlock,play,stop,get activeCount(){return active.size;},get status(){return context?.state||'未启用';}};
}
