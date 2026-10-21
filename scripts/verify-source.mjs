import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const m=JSON.parse(readFileSync(new URL('../source-manifest.json',import.meta.url)));
for(const f of m.files){const digest=createHash('sha256').update(readFileSync(new URL('../'+f.file,import.meta.url))).digest('hex');if(digest!==f.sha256)throw Error('Source changed: '+f.file);}
console.log(`${m.files.length} source files match the exported website modules.`);
