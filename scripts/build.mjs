import { mkdir, copyFile, readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
await mkdir(new URL('dist/src/', root), { recursive:true });
await copyFile(new URL('index.html',root),new URL('dist/index.html',root));
await copyFile(new URL('LICENSE',root),new URL('dist/LICENSE',root));
for(const file of await readdir(new URL('src/',root))) await copyFile(new URL('src/'+file,root),new URL('dist/src/'+file,root));
const html=await readFile(new URL('index.html',root),'utf8');
const css=await readFile(new URL('src/style.css',root),'utf8');
const compiled=new Map(),visiting=new Set();
const importPattern=/^import\s*\{([^}]+)\}\s*from\s*['"](.+?)['"];\s*$/gm;
const reexportPattern=/^export\s*\{([^}]+)\}\s*from\s*['"](.+?)['"];\s*$/gm;
async function compile(name){
  if(compiled.has(name))return;if(visiting.has(name))throw new Error('Circular module import: '+name);visiting.add(name);
  if(!/^[\w-]+\.js$/.test(name))throw new Error('Unsupported module name');
  let source=await readFile(new URL('src/'+name,root),'utf8');const exported=[];
  const imports=[...source.matchAll(importPattern)],reexports=[...source.matchAll(reexportPattern)];
  for(const match of [...imports,...reexports]){if(!/^\.\/[\w-]+\.js$/.test(match[2]))throw new Error('Only local flat source imports are supported');await compile(match[2].slice(2));}
  source=source.replace(importPattern,(_,names,path)=>`const {${names}}=__modules[${JSON.stringify(path.slice(2))}];`);
  source=source.replace(reexportPattern,(_,names,path)=>{for(const name of names.split(',').map(x=>x.trim()))exported.push(`${name}:__modules[${JSON.stringify(path.slice(2))}].${name}`);return '';});
  source=source.replace(/\bexport\s+(async\s+)?(const|let|function|class)\s+(\w+)/g,(_,asyncKeyword,kind,name)=>{exported.push(name);return `${asyncKeyword||''}${kind} ${name}`;});
  if(/^\s*(?:import|export)\s/m.test(source))throw new Error('Unsupported module syntax: '+name);
  compiled.set(name,`__modules[${JSON.stringify(name)}]=(()=>{\n${source}\nreturn {${exported.join(',')}};\n})();`);visiting.delete(name);
}
await compile('app.js');
const bundled='const __modules=Object.create(null);\n'+[...compiled.values()].join('\n');
const standalone=html.replace('<link rel="stylesheet" href="./src/style.css">',()=>`<style>${css}</style>`).replace('<script type="module" src="./src/app.js"></script>',()=>`<script type="module">\n${bundled}\n</script>`);
await writeFile(new URL('dist/play.html',root),standalone);
console.log('Build complete: '+fileURLToPath(new URL('dist/',root)));
