import {TYPES,validateProject,example,initialState,createRuntime} from './core.js';
import {createEditor} from './editor.js';
import {createAudio} from './audio.js';
import {SPRITES} from './sprites.js';
import {loadProject,saveProject} from './persistence.js';
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
const names={fox:'小狐狸',rabbit:'小兔子',robot:'小机器人'},backdrops={meadow:'青草地',space:'星空',paper:'方格纸'};
const history=[],audio=createAudio(),senses={mouseX:0,mouseY:0,mouseDown:false,keys:new Set()};
let project=example(),state,controller=null,runtime=null,toastTimer,bootMessage='',audioProblem='';
try{project=loadProject(localStorage)||project;}catch{bootMessage='存档无法读取，已载入示例；原存档保留，编辑后才会保存。';}
state=initialState(project);
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,4000);}
function save(){try{saveProject(localStorage,project);$('saveStatus').textContent='● 已保存到本机';}catch{$('saveStatus').textContent='保存失败，请导出备份';}}
function change(next,{render:shouldRender=true,record=true,quiet=false}={}){
  if(controller)return false;
  try{const valid=validateProject(next);if(JSON.stringify(valid)===JSON.stringify(project))return true;if(record){history.push(JSON.stringify(project));if(history.length>30)history.shift();}if(valid.sprite!==project.sprite)state.costume=valid.sprite;if(valid.backdrop!==project.backdrop)state.backdrop=valid.backdrop;project=valid;save();if(shouldRender)render();else $('undoButton').disabled=!history.length;return true;}
  catch(error){if(!quiet)toast(error.message);return false;}
}
const editor=createEditor({getProject:()=>project,isRunning:()=>!!controller,onChange:change,notice:toast,getState:()=>state,getSensing:()=>senses});
function renderMonitor(){
  const values=controller?state.variables:new Map((project.variables||[]).map(v=>[v.name,v.value]));
  $('variableMonitor').replaceChildren();for(const [name,value] of values){const row=element('div','variable-watch');row.append(element('span','',name),element('strong','',String(value)));$('variableMonitor').append(row);}
}
function renderStage(){
  const backdrop=state.backdrop||project.backdrop,costume=state.costume||project.sprite;
  $('stage').className='stage '+backdrop;$('stageBadge').textContent=backdrops[backdrop];
  $('sprite').innerHTML=SPRITES[costume];$('sprite').setAttribute('transform',`translate(${240+state.x} ${180-state.y}) rotate(${state.angle}) scale(${state.size/100})`);$('sprite').style.display=state.visible?'':'none';
  $('spriteThumbnail').innerHTML=`<svg viewBox="-45 -50 90 100" aria-hidden="true">${SPRITES[costume]}</svg>`;
  $('drawing').replaceChildren(...state.lines.map(line=>{const node=document.createElementNS(NS,'line');for(const key of ['x1','x2'])node.setAttribute(key,240+line[key]);for(const key of ['y1','y2'])node.setAttribute(key,180-line[key]);return node;}));
  $('speech').hidden=!state.speech;$('speech').textContent=(state.thought?'💭 ':'')+state.speech;$('speech').style.left=`${Math.max(7,Math.min(67,(240+state.x)/480*100))}%`;$('speech').style.top=`${Math.max(27,Math.min(88,(180-state.y)/360*100-14))}%`;
  $('xValue').textContent=Math.round(state.x);$('yValue').textContent=Math.round(state.y);$('angleValue').textContent=Math.round(state.angle)+'°';$('spriteName').textContent=names[costume];$('audioStatus').textContent='音量 '+Math.round(state.volume)+'%'+(audioProblem?' · '+audioProblem:'');renderMonitor();
}
function render(){
  $('projectName').value=project.name;$('spriteSelect').value=project.sprite;$('backdropSelect').value=project.backdrop;document.body.classList.toggle('running',!!controller);
  for(const id of ['runButton','newButton','clearButton','importButton','spriteSelect','backdropSelect','projectName'])$(id).disabled=!!controller;
  document.querySelectorAll('[data-example]').forEach(btn=>btn.disabled=!!controller);$('stopButton').disabled=!controller;$('undoButton').disabled=!!controller||!history.length;editor.render();renderStage();
}
function cancel(){controller?.abort();runtime?.stop();audio.stop();}
function usesSound(items){return items.some(b=>TYPES[b.type].category==='sound'||usesSound(b.children||[])||usesSound(b.otherwise||[]));}
async function run(){
  if(controller)return;if(!project.blocks.length){toast('先从积木盒添加一块积木吧');return;}
  const current=new AbortController();controller=current;audioProblem='';state=initialState(project);render();$('runStatus').textContent='正在执行你的创意…';$('stageMessage').textContent='绿旗已启动，按 Escape 或停止结束';
  let sessionError=null;
  try{
    if(usesSound(project.blocks)){try{await audio.unlock();}catch(error){audioProblem='声音不可用';throw error;}}
    const session=createRuntime(project,{signal:current.signal,sensing:()=>senses,onSound:event=>audio.play(event),onError:error=>{sessionError=error;toast(error.message);},onStep:(next,id)=>{state=next;renderStage();document.querySelectorAll('.executing').forEach(el=>el.classList.remove('executing'));document.querySelector(`[data-id="${CSS.escape(id)}"]`)?.classList.add('executing');}});
    runtime=session;state=session.state;await session.start();await session.drain();
    if(session.hasListeners){$('runStatus').textContent='等待事件：按键或点击角色';$('stageMessage').textContent='事件监听中 · 点角色、按键触发，红方块结束';await new Promise(resolve=>{if(session.signal.aborted)resolve();else session.signal.addEventListener('abort',resolve,{once:true});});if(sessionError)throw sessionError;$('runStatus').textContent='已停止，可以继续编辑';}
    else{$('runStatus').textContent='运行完成，做得不错！';$('stageMessage').textContent='又一个想法，变成了现实 ✦';}
  }catch(error){$('runStatus').textContent=error.name==='AbortError'?'已停止，可以继续编辑':'执行结束：'+error.message;$('stageMessage').textContent=error.name==='AbortError'?'准备好了，随时再试一次':error.message;if(error.name!=='AbortError')toast(error.message);}
  finally{if(controller===current){runtime?.stop();runtime=null;controller=null;audio.stop();senses.keys.clear();senses.mouseDown=false;render();}}
}
function trigger(kind,value){if(!runtime)return;try{const result=kind==='key'?runtime.triggerKey(value):runtime.triggerClick();result.catch(error=>{if(error.name!=='AbortError')toast(error.message);});}catch(error){if(error.name!=='AbortError')toast(error.message);}}
$('runButton').addEventListener('click',run);$('stopButton').addEventListener('click',cancel);
$('resetButton').addEventListener('click',()=>{cancel();state=initialState(project);renderStage();$('stageMessage').textContent='舞台已复位';});
$('clearButton').addEventListener('click',()=>change({...project,blocks:[]}));
$('newButton').addEventListener('click',()=>{editor.resetTarget();change({version:1,name:'我的新作品',sprite:'fox',backdrop:'meadow',blocks:[]});state=initialState(project);renderStage();$('runStatus').textContent='准备好开始创作';});
$('undoButton').addEventListener('click',()=>{if(controller||!history.length)return;project=validateProject(JSON.parse(history.pop()));state=initialState(project);save();render();toast('已撤销上一次编辑');});
$('projectName').addEventListener('input',()=>{const name=$('projectName').value.trim();if(name)change({...project,name},{render:false});});
for(const [id,key] of [['spriteSelect','sprite'],['backdropSelect','backdrop']])$(id).addEventListener('change',()=>change({...project,[key]:$(id).value}));
document.querySelectorAll('[data-example]').forEach(btn=>btn.addEventListener('click',()=>{editor.resetTarget();change(example(btn.dataset.example));state=initialState(project);renderStage();$('runStatus').textContent='示例已就绪，点击绿旗运行';toast('已载入示例，可撤销恢复之前的作品');}));
$('exportButton').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(project,null,2)],{type:'application/json'})),link=element('a');link.href=url;link.download=(project.name.replace(/[<>:"/\\|?*]/g,'_')||'作品')+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已发起导出，请在下载或保存对话框确认');});
$('importButton').addEventListener('click',()=>$('fileInput').click());
$('fileInput').addEventListener('change',async()=>{const file=$('fileInput').files[0];if(!file)return;try{if(file.size>200000)throw new Error('请选择 200 KB 以内的作品');const imported=validateProject(JSON.parse(await file.text()));if(controller)throw new Error('请先停止执行再导入');editor.resetTarget();if(change(imported)){state=initialState(project);renderStage();toast('已导入作品，点击绿旗试试看');}}catch(error){toast(error instanceof SyntaxError?'文件不是有效的 JSON，原作品已保留':error.message);}finally{$('fileInput').value='';}});
$('helpButton').addEventListener('click',()=>$('helpDialog').showModal());for(const id of ['closeHelp','startCreating'])$(id).addEventListener('click',()=>$('helpDialog').close());
const normalizedKey=key=>key===' '?'space':key.length===1?key.toLowerCase():key;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&controller){cancel();return;}if(/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)||e.target.closest('dialog'))return;const key=normalizedKey(e.key);senses.keys.add(key);if(controller&&['space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key))e.preventDefault();if(!e.repeat)trigger('key',key);});
document.addEventListener('keyup',e=>senses.keys.delete(normalizedKey(e.key)));window.addEventListener('blur',()=>{senses.keys.clear();senses.mouseDown=false;});
$('stage').addEventListener('pointermove',e=>{const rect=$('stageSvg').getBoundingClientRect();senses.mouseX=Math.round(Math.max(-240,Math.min(240,(e.clientX-rect.left)/rect.width*480-240)));senses.mouseY=Math.round(Math.max(-180,Math.min(180,180-(e.clientY-rect.top)/rect.height*360)));});
$('stage').addEventListener('pointerdown',()=>senses.mouseDown=true);window.addEventListener('pointerup',()=>senses.mouseDown=false);window.addEventListener('pointercancel',()=>senses.mouseDown=false);
$('sprite').addEventListener('click',()=>trigger('click'));$('sprite').addEventListener('keydown',e=>{if(e.key==='Enter'){e.stopPropagation();trigger('click');}});
render();if(bootMessage)toast(bootMessage);else save();
