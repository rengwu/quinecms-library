import { cp, mkdir, writeFile, symlink, rm, readFile } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
const require=createRequire(import.meta.url);
const engine=dirname(require.resolve('quinecms/package.json'));
const root=resolve('.quinecms/site');
await mkdir(join(root,'node_modules'),{recursive:true});
for(const [name,path] of [['quinecms',engine],['quinecms-library',resolve('.')]]){
  await rm(join(root,'node_modules',name),{recursive:true,force:true});
  await symlink(path,join(root,'node_modules',name),'dir');
}
const enginePackage=JSON.parse(await readFile(join(engine,'package.json'),'utf8'));
await writeFile(join(root,'package.json'),JSON.stringify({type:'module',dependencies:{quinecms:enginePackage.version,'quinecms-library':'0.1.0'}}));
await writeFile(join(root,'pnpm-lock.yaml'),'lockfileVersion: "9.0"\n');
await writeFile(join(root,'quinecms.config.json'),JSON.stringify({libraries:['quinecms-library'],initialLayout:{id:'archline',version:1}}));
await cp('tests/fixtures/archline/content',join(root,'content'),{recursive:true});
const result=spawnSync(process.execPath,[join(engine,'bin/quinecms.mjs'),'validate'],{cwd:root,stdio:'inherit'});
process.exitCode=result.status??1;
