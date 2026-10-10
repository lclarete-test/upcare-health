import {readdirSync,readFileSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {join,extname,relative} from 'node:path';
const root=existsSync('public')?'public':'.';const files={};const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const path=join(dir,e.name);if(e.isDirectory())walk(path);else{files['/'+relative(root,path)]={type:types[extname(path)]||'application/octet-stream',data:readFileSync(path).toString('base64')};}}}
if(root==='public')walk(root);else{for(const dir of ['assets','stories','editorial-policy','our-approach','photo-credits'])if(existsSync(dir))walk(dir);for(const name of ['index.html','robots.txt','sitemap.xml'])if(existsSync(name))files['/'+name]={type:types[extname(name)],data:readFileSync(name).toString('base64')};}mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
writeFileSync('dist/server/index.js','const assets='+JSON.stringify(files)+';\n'+readFileSync('worker/feedback.js','utf8'));
writeFileSync('dist/.openai/hosting.json',readFileSync('.openai/hosting.json'));
console.log('Built worker with '+Object.keys(files).length+' unchanged site paths');
