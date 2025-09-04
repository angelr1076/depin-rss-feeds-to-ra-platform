import fs from 'node:fs/promises';
import path from 'node:path';
import cron from 'node-cron';
import { fetchFeed } from './rsshub.js';
import { normalizeItems } from './normalize.js';
import { ensureFieldsAndMapIds } from './ensureFields.js';
import { upsertItems } from './upsert.js';
import { RSSHUB_BASE } from './config.js';
import { CRON_SCHEDULE } from './config.js';

// Load feeds list
const feedsPath = path.resolve('feeds.json');
const raw = JSON.parse(await fs.readFile(feedsPath, 'utf8'));
const feeds = Array.isArray(raw) ? raw : [raw];
console.log(
  '[depin] feeds:',
  feeds.map(f => f.source)
);

async function runOnce() {
  console.log(`[depin] RSSHub base: ${RSSHUB_BASE}`);
  const idMap = await ensureFieldsAndMapIds();

  let total = 0;
  for (const f of feeds) {
    const feed = await fetchFeed(f.url);
    const items = normalizeItems(feed, f.source, f.url);
    if (!items.length) continue;

    await upsertItems(items, idMap);
    total += items.length;
    console.log(`Upserted ${items.length} items from "${f.source}"`);
  }
  console.log(`Done. Total upserted records: ${total}`);
}

// If --once, just run. Otherwise schedule based on CRON_SCHEDULE in .env
if (process.argv.includes('--once')) {
  runOnce().catch(e => {
    console.error(e);
    process.exit(1);
  });
} else {
  cron.schedule(CRON_SCHEDULE, () => {
    runOnce().catch(e => console.error(e));
  });
  console.log(
    `Scheduled job using CRON: "${CRON_SCHEDULE}". Press Ctrl+C to stop.`
  );
}
