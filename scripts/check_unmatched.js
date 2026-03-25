const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const lines = env.split('\n');
const supabaseUrl = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1]?.trim();
const supabaseKey = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY='))?.split('=')[1]?.trim();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: events } = await supabase.from('events').select('location');
  const { data: venues } = await supabase.from('venues').select('*');
  
  if (!events || !venues) {
    console.error('Failed to retrieve events or venues data. They might be null.');
    return;
  }

  const unmatched = [];
  events.forEach(e => {
    if (!e.location) return;
    if (/(オンライン|配信|YouTube|SHOWROOM|LINE LIVE|teket|Talkport|Zoom|電話|ニコニコ|ABEMA|TikTok|mu-mo|OPENREC|LINE ビデオ通話|ネット)/i.test(e.location)) {
      return;
    }
    let matched = false;
    for (const v of venues) {
      if (v.keywords.some(k => e.location.includes(k))) {
        matched = true; break;
      }
    }
    if (!matched) unmatched.push(e.location);
  });
  console.log("Unmatched count:", unmatched.length);
  console.log("Unmatched locations:\n" + Array.from(new Set(unmatched)).join('\n'));
}
run();
