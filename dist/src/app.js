import { TYPES, block, validateProject, example, editTree, moveInTree, countBlocks, initialState, execute } from './core.js';
const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const STORAGE = 'inspiration-blocks-v1';
const categories = { motion:'运动', looks:'外观', control:'控制', pen:'画笔' };
const names = { fox:'小狐狸',rabbit:'小兔子',robot:'小机器人' };
const backdrops = { meadow:'青草地',space:'星空',paper:'方格纸' };
const history = [];
let project = example(), state = initialState(), category = 'motion', controller = null, toastTimer, bootMessage = '', insertionTarget = 'root';
try { const saved = localStorage.getItem(STORAGE); if (saved) project = validateProject(JSON.parse(saved)); }
catch { bootMessage = '本机存档无法读取，已载入示例。可导入备份作品。'; }
const spriteArt = {
  fox:'<path d="M-10 12C-47 19-43-18-32-23q-2 22 24 18" fill="#e8843d"/><path d="M-32-23q-4 14 3 22l-10-3q-8-14 7-19" fill="#fff4df"/><ellipse cx="-2" cy="7" rx="21" ry="14" fill="#ed9349"/><path d="M-12 16v8h8l2-9M9 16v8h8l-1-11" fill="#88533e"/><path d="M4-8L7-33l14 13 12-9-1 29q-5 18-20 15L1 3Z" fill="#ed9349"/><path d="M10-27l8 10-9 0m17-5l3-1-1 10" fill="#8f5949"/><path d="M5-1q8 1 13 7L32-3l-2 12q-11 15-21 1Z" fill="#fff5e3"/><ellipse cx="24" cy="-5" rx="2.3" ry="3" fill="#473c40"/><path d="m31 0 6 2-5 4Z" fill="#473c40"/><path d="M19 8q3 4 6 0" stroke="#b87a58" stroke-width="1.4" fill="none"/>',
  rabbit:'<ellipse cx="-2" cy="9" rx="21" ry="17" fill="#f5ecf4"/><circle cx="-23" cy="8" r="8" fill="#fff"/><ellipse cx="10" cy="-26" rx="7" ry="22" fill="#f5ecf4" transform="rotate(-10 10 -26)"/><ellipse cx="24" cy="-23" rx="7" ry="23" fill="#f5ecf4" transform="rotate(17 24 -23)"/><path d="M10-40v22m17-22-5 22" stroke="#e8b8d2" stroke-width="5" stroke-linecap="round"/><circle cx="15" cy="-3" r="19" fill="#fff6fb"/><circle cx="21" cy="-7" r="2.5" fill="#554656"/><ellipse cx="33" cy="0" rx="3" ry="2.5" fill="#d58ba8"/><path d="M-13 21h14m6 0h15" stroke="#d0bdcf" stroke-width="6" stroke-linecap="round"/><circle cx="20" cy="3" r="4" fill="#f4ccdf"/>',
  robot:'<path d="M0-28v-8" stroke="#6d79a6" stroke-width="3"/><circle cx="0" cy="-38" r="4" fill="#dca95a"/><rect x="-22" y="-27" width="44" height="33" rx="9" fill="#a2badb"/><rect x="-16" y="-20" width="32" height="18" rx="5" fill="#425771"/><circle cx="-8" cy="-12" r="3" fill="#a3e7dc"/><circle cx="8" cy="-12" r="3" fill="#a3e7dc"/><rect x="-17" y="7" width="34" height="22" rx="7" fill="#adc7df"/><path d="M-24 10v13m48-13v13M-9 29v8m18-8v8" stroke="#7895b9" stroke-width="7" stroke-linecap="round"/><circle cx="0" cy="17" r="5" fill="#f1ce7f"/>'
};
function element(tag, className, text) { const el = document.createElement(tag); if(className)el.className=className;if(text!==undefined)el.textContent=text;return el; }
function toast(message) { clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,3500); }
function save() {
  try { localStorage.setItem(STORAGE,JSON.stringify(project));$('saveStatus').textContent='● 已保存到本机'; }
  catch { $('saveStatus').textContent='保存不可用，请导出备份'; }
}
function change(next) {
  try { const valid=validateProject(next); history.push(JSON.stringify(project));if(history.length>30)history.shift();project=valid;if(insertionTarget!=='root' && !findBlock(project.blocks,insertionTarget))insertionTarget='root';save();render();return true; }
  catch(error){toast(error.message);return false;}
}
function findBlock(blocks,id) { for(const b of blocks){if(b.id===id)return b;const found=b.children && findBlock(b.children,id);if(found)return found;} }
function addBlock(type,parent=insertionTarget) {
  if(controller)return;
  const added=block(type);
  const blocks=parent==='root'?[...project.blocks,added]:editTree(project.blocks,parent,b=>({...b,children:[...b.children,added]}));
  if(change({...project,blocks}))toast('已添加'+TYPES[type].label+'积木');
}
function renderPalette() {
  $('palette').replaceChildren();$('categoryName').textContent=categories[category]+'积木';
  document.querySelectorAll('[data-category]').forEach(btn=>btn.classList.toggle('active',btn.dataset.category===category));
  for(const [type,d] of Object.entries(TYPES)) {
    if(d.category!==category)continue;
    const button=element('button',`palette-block ${category}`);button.draggable=!controller;button.disabled=!!controller;button.dataset.type=type;button.setAttribute('aria-label',`添加${d.label}积木`);
    button.append(document.createTextNode(type==='turn'?'↻ '+d.label+' ':d.label+' '));
    if('value' in d)button.append(element('span','sample-value',d.value));
    if(type==='goto')button.append(element('span','sample-value','x: 0  y: 0'));
    if(d.unit)button.append(document.createTextNode(d.unit));
    button.addEventListener('click',()=>addBlock(type));
    button.addEventListener('dragstart',e=>{e.dataTransfer.setData('application/x-block',JSON.stringify({type}));e.dataTransfer.effectAllowed='copy';});
    $('palette').append(button);
  }
}
function parameter(b,field,label) {
  const d=TYPES[b.type];
  const input=element('input');input.type=b.type==='say'?'text':'number';input.value=b[field];input.disabled=!!controller;input.setAttribute('aria-label',label);
  if(input.type==='text')input.maxLength=80;else {input.min=field==='x'?-240:field==='y'?-180:d.min;input.max=field==='x'?240:field==='y'?180:d.max;input.step=b.type==='repeat'?'1':'any';}
  let recorded=false;
  const commit=()=>{
    try {
      const valid=validateProject({...project,blocks:editTree(project.blocks,b.id,item=>({...item,[field]:input.value}))});
      if(JSON.stringify(valid)!==JSON.stringify(project)) {
        if(!recorded){history.push(JSON.stringify(project));if(history.length>30)history.shift();recorded=true;}
        project=valid;save();$('undoButton').disabled=false;
      }
      return true;
    }catch{return false;}
  };
  input.addEventListener('input',()=>{if(input.value!=='' || input.type==='text')commit();});
  input.addEventListener('blur',()=>{if(!commit())toast('请输入有效参数');input.value=findBlock(project.blocks,b.id)?.[field] ?? b[field];recorded=false;});
  input.addEventListener('dragstart',e=>e.preventDefault());
  return input;
}
function buildList(blocks,target) {
  const list=element('div','block-list');list.dataset.target=target;
  if(!blocks.length && target!=='root')list.append(element('div','empty-drop','＋ 拖入要重复的积木'));
  blocks.forEach(b=>{
    const d=TYPES[b.type];const wrapper=element('div',`code-block ${d.category}`);wrapper.dataset.id=b.id;
    const row=element('div','block-row');row.draggable=!controller;row.append(element('span','grip','⠿'),document.createTextNode((b.type==='turn'?'↻ ':'')+d.label+' '));
    if(b.type==='goto') {row.append(document.createTextNode('x'),parameter(b,'x','目标 X 坐标'),document.createTextNode('y'),parameter(b,'y','目标 Y 坐标'));}
    else if('value' in d)row.append(parameter(b,'value',`${d.label}参数`));
    if(d.unit)row.append(document.createTextNode(d.unit));
    const actions=element('span','block-actions');
    [['↑','上移',-1],['↓','下移',1],['×','删除',0]].forEach(([text,label,dir])=>{
      const btn=element('button','',text);btn.disabled=!!controller;btn.setAttribute('aria-label',`${label}${d.label}积木`);btn.addEventListener('click',()=>change({...project,blocks:dir?moveInTree(project.blocks,b.id,dir):editTree(project.blocks,b.id,()=>[])}));actions.append(btn);
    });
    row.append(actions);wrapper.append(row);
    row.addEventListener('dragstart',e=>{if(controller){e.preventDefault();return;}e.stopPropagation();e.dataTransfer.setData('application/x-block',JSON.stringify({id:b.id}));e.dataTransfer.effectAllowed='move';});
    if(b.children) {const body=element('div','repeat-body');body.append(buildList(b.children,b.id));const add=element('button','add-here',insertionTarget===b.id?'✓ 积木将添加在这里':'＋ 向此循环添加积木');add.disabled=!!controller;add.addEventListener('click',()=>{insertionTarget=b.id;renderScript();toast('现在点击积木盒中的积木，就会加入此循环');});body.append(add);wrapper.append(body,element('div','repeat-end'));}
    list.append(wrapper);
  });
  return list;
}
function renderScript() {
  const next=buildList(project.blocks,'root');next.id='script';next.classList.add('root-list');const add=element('button','add-root',insertionTarget==='root'?'＋ 拖入积木，或点击积木盒添加':'＋ 改为向程序末尾添加');add.disabled=!!controller;add.addEventListener('click',()=>{insertionTarget='root';renderScript();toast('现在点击积木盒中的积木，将添加到程序末尾');});next.append(add);$('script').replaceWith(next);$('blockCount').textContent=`${countBlocks(project.blocks)} 块积木`;
}
function renderStage() {
  $('stage').className='stage '+project.backdrop;$('stageBadge').textContent=backdrops[project.backdrop];
  $('sprite').innerHTML=spriteArt[project.sprite];
  // SVG art is a fixed trusted string; all project text uses textContent or value.
  $('sprite').setAttribute('transform',`translate(${240+state.x} ${180-state.y}) rotate(${state.angle})`);
  $('spriteThumbnail').innerHTML=`<svg viewBox="-45 -50 90 100" aria-hidden="true">${spriteArt[project.sprite]}</svg>`;
  $('drawing').replaceChildren(...state.lines.map(line=>{const el=document.createElementNS(NS,'line');for(const key of ['x1','x2'])el.setAttribute(key,240+line[key]);for(const key of ['y1','y2'])el.setAttribute(key,180-line[key]);return el;}));
  $('speech').hidden=!state.speech;$('speech').textContent=state.speech;
  $('speech').style.left=`${Math.max(7,Math.min(67,(240+state.x)/480*100))}%`;
  $('speech').style.top=`${Math.max(27,Math.min(88,(180-state.y)/360*100-14))}%`;
  $('xValue').textContent=Math.round(state.x);$('yValue').textContent=Math.round(state.y);$('angleValue').textContent=Math.round(state.angle)+'°';$('spriteName').textContent=names[project.sprite];
}
function render() {
  if(insertionTarget!=='root' && !findBlock(project.blocks,insertionTarget))insertionTarget='root';
  $('projectName').value=project.name;$('spriteSelect').value=project.sprite;$('backdropSelect').value=project.backdrop;
  document.body.classList.toggle('running',!!controller);
  for(const id of ['runButton','newButton','clearButton','importButton','spriteSelect','backdropSelect','projectName'])$(id).disabled=!!controller;
  document.querySelectorAll('[data-example]').forEach(btn=>btn.disabled=!!controller);
  $('stopButton').disabled=!controller;$('undoButton').disabled=!!controller || !history.length;
  renderPalette();renderScript();renderStage();
}
function cancel() { if(controller)controller.abort(); }
async function run() {
  if(controller)return;
  if(!project.blocks.length){toast('先从积木盒添加一块积木吧');return;}
  const current=new AbortController();controller=current;state=initialState();render();$('runStatus').textContent='正在执行你的创意…';$('stageMessage').textContent='看，积木让角色动起来了';
  try {
    state=await execute(project.blocks,{signal:current.signal,onStep:(next,id)=>{
      state=next;renderStage();document.querySelectorAll('.executing').forEach(el=>el.classList.remove('executing'));document.querySelector(`[data-id="${CSS.escape(id)}"]`)?.classList.add('executing');
    }});
    $('runStatus').textContent='运行完成，做得不错！';$('stageMessage').textContent='又一个想法，变成了现实 ✦';
  } catch(error) {
    $('runStatus').textContent=error.name==='AbortError'?'已停止，可以继续编辑':'执行结束';$('stageMessage').textContent=error.name==='AbortError'?'准备好了，随时再试一次':error.message;
    if(error.name!=='AbortError')toast(error.message);
  } finally { if(controller===current){controller=null;render();} }
}
document.querySelectorAll('[data-category]').forEach(btn=>btn.addEventListener('click',()=>{category=btn.dataset.category;renderPalette();}));
$('runButton').addEventListener('click',run);$('stopButton').addEventListener('click',cancel);
$('resetButton').addEventListener('click',async()=>{cancel();state=initialState();renderStage();$('stageMessage').textContent='舞台已复位，开始新的尝试';});
$('clearButton').addEventListener('click',()=>change({...project,blocks:[]}));
$('newButton').addEventListener('click',()=>{insertionTarget='root';change({version:1,name:'我的新作品',sprite:'fox',backdrop:'meadow',blocks:[]});state=initialState();renderStage();toast('新作品准备好了，试着添加积木吧');});
$('undoButton').addEventListener('click',()=>{if(controller || !history.length)return;project=validateProject(JSON.parse(history.pop()));save();render();toast('已撤销上一次编辑');});
$('projectName').addEventListener('change',()=>change({...project,name:$('projectName').value.trim() || '我的新作品'}));
for(const [id,key] of [['spriteSelect','sprite'],['backdropSelect','backdrop']])$(id).addEventListener('change',()=>change({...project,[key]:$(id).value}));
document.querySelectorAll('[data-example]').forEach(btn=>btn.addEventListener('click',()=>{change(example(btn.dataset.example));state=initialState();renderStage();$('runStatus').textContent='示例已就绪，点击绿旗运行';toast('已载入示例，可撤销恢复之前的作品');}));
$('exportButton').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(project,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=element('a');a.href=url;a.download=(project.name.replace(/[<>:"/\\|?*]/g,'_') || '作品')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('作品已导出，记得保留这份小灵感');});
$('importButton').addEventListener('click',()=>$('fileInput').click());
$('fileInput').addEventListener('change',async()=>{
  const file=$('fileInput').files[0];if(!file)return;
  try {if(file.size>200000)throw new Error('文件太大，请选择 200 KB 以内的作品');const imported=validateProject(JSON.parse(await file.text()));if(controller)throw new Error('请先停止执行再导入');if(change(imported)){state=initialState();renderStage();toast('已导入作品，点击绿旗试试看');}}
  catch(error){toast(error instanceof SyntaxError?'文件不是有效的 JSON，原作品已保留':error.message);}
  finally{$('fileInput').value='';}
});
$('helpButton').addEventListener('click',()=>$('helpDialog').showModal());for(const id of ['closeHelp','startCreating'])$(id).addEventListener('click',()=>$('helpDialog').close());
document.addEventListener('keydown',e=>{if(e.key==='Escape' && controller)cancel();});
document.addEventListener('dragover',e=>{
  const list=e.target.closest('.block-list');if(!list || controller || !Array.from(e.dataTransfer.types).includes('application/x-block'))return;
  e.preventDefault();document.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over'));list.classList.add('drag-over');
});
document.addEventListener('dragend',()=>document.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over')));
document.addEventListener('drop',e=>{
  document.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over'));
  const list=e.target.closest('.block-list');if(!list || controller)return;e.preventDefault();
  try {
    const data=JSON.parse(e.dataTransfer.getData('application/x-block'));const parent=list.dataset.target;
    const moving=data.id?findBlock(project.blocks,data.id):block(data.type);
    if(!moving)return;
    if(parent===moving.id || (moving.children && findBlock(moving.children,parent))){toast('不能把循环放进自己里面');return;}
    const targetRow=e.target.closest('.block-row');const before=targetRow?.parentElement.parentElement===list?targetRow.parentElement.dataset.id:null;
    if(before===moving.id)return;
    let blocks=data.id?editTree(project.blocks,data.id,()=>[]):project.blocks;
    const insert=items=>{const next=[...items];const i=next.findIndex(b=>b.id===before);next.splice(i<0?next.length:i,0,moving);return next;};
    blocks=parent==='root'?insert(blocks):editTree(blocks,parent,b=>({...b,children:insert(b.children)}));change({...project,blocks});
  }catch(error){toast(error.message || '无法添加这块积木');}
});
render();if(bootMessage)toast(bootMessage);else save();
