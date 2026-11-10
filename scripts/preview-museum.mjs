// Read local development credentials in memory. Never print or persist them.
import {execFileSync,spawn} from 'node:child_process';
const status=JSON.parse(execFileSync('supabase',['status','-o','json'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}));
if(!status.API_URL || !['127.0.0.1','localhost'].includes(new URL(status.API_URL).hostname))throw Error('Local Supabase required');
const args=process.argv.includes('--build')?['build','--webpack']:process.argv.includes('--production')?['start','--hostname','127.0.0.1','--port','3001']:['dev','--webpack','--hostname','127.0.0.1','--port','3000'];
const child=spawn(process.execPath,['node_modules/next/dist/bin/next',...args],{stdio:'inherit',env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:status.API_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY:status.ANON_KEY,NEXT_PUBLIC_VERCEL_ENV:'development',MUSEUM_EDITORIAL_PREVIEW:'1'}});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??1));
