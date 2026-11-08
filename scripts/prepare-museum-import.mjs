// Produces a review plan, never publishes or writes to a database.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const cards=(await readFile('data/research/museum/cards.jsonl','utf8')).trim().split('\n').map(JSON.parse);
const plan={schema_version:'1.0',event_id:167,generated_at:new Date().toISOString(),status:'editorial_review_required',
 warning:'This is a draft RPC plan, not public data. Resolve canonical source and historical person IDs with a human reviewer. Never auto-publish.',
 items:cards.map(card=>({research_key:card.id,review_status:'pending',unresolved:["canonical_source_id",...(card.speaker==='坂元葉月'?["historical_member_id"]:[])],rpc:'save_event_exhibit_draft',payload:{research_key:card.id,event_id:card.event_id,source_id:null,member_id:card.member_id,speaker:card.speaker,phase:card.phase,relation_kind:card.relation_kind,summary:card.summary,locator:card.locator,published_on:card.published_on,published_at:card.published_at,date_precision:card.date_precision,original_date_label:card.original_date_label,original_publication_confirmed:card.original_publication_confirmed}}))};
await mkdir('data/import/museum',{recursive:true});
await writeFile('data/import/museum/event-167-draft-plan.json',JSON.stringify(plan,null,2)+'\n');
console.log(`Prepared ${plan.items.length} draft RPC requests; no database writes, approvals or publication.`);
