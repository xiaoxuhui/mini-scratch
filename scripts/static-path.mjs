import { resolve, sep } from 'node:path';
export function resolveStaticPath(root, pathname) {
  const base=resolve(root);
  const path=resolve(base,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));
  if(path!==base && !path.startsWith(base+sep)) throw new Error('Forbidden');
  return path;
}
