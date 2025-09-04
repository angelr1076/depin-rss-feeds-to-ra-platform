import Parser from 'rss-parser';
import { RSSHUB_BASE } from './config.js';

const parser = new Parser({
  headers: {
    'User-Agent':
      process.env.QB_AGENT || 'DepinRSSBot/1.0 (+contact@example.com)',
  },
  timeout: 15000,
});

export async function fetchFeed(pathOrUrl) {
  const url = pathOrUrl.startsWith('http')
    ? pathOrUrl
    : `${RSSHUB_BASE}${pathOrUrl}`;

  return parser.parseURL(url); // Title, items[], etc.
}
