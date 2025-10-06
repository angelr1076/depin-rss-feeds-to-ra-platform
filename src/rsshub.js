import Parser from 'rss-parser';
import { RSSHUB_BASE, RSSHUB_MIRROR } from './config.js';

const USER_AGENT =
  process.env.QB_AGENT ||
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

const parser = new Parser({
  headers: {
    'User-Agent': USER_AGENT,
    Accept:
      'application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8',
  },
  timeout: 20000,
});

function toRsshubReddit(url) {
  try {
    const u = new URL(url);
    if (
      !/reddit\.com$/i.test(u.hostname) &&
      !/reddit\.com$/i.test(u.hostname.replace(/^old\./, ''))
    ) {
      return null;
    }
    // subreddit feeds
    const m1 = u.pathname.match(/^\/r\/([^/]+)\/?/i);
    if (m1 && u.pathname.includes('.rss')) {
      return `/reddit/subreddit/${m1[1]}`;
    }
    // search feeds
    if (u.pathname === '/search.rss' || u.pathname === '/search') {
      const q = u.searchParams.get('q') || '';
      const sort = u.searchParams.get('sort') || '';
      const base = `/reddit/search/${encodeURIComponent(q)}`;
      return sort ? `${base}?sort=${encodeURIComponent(sort)}` : base;
    }
    return null;
  } catch {
    return null;
  }
}

function buildCandidates(pathOrUrl) {
  const rhPath = pathOrUrl.startsWith('http')
    ? toRsshubReddit(pathOrUrl)
    : null;

  const paths = [];
  if (rhPath) {
    paths.push(rhPath);
  } else if (pathOrUrl.startsWith('http')) {
    return [pathOrUrl];
  } else {
    paths.push(pathOrUrl);
  }

  const base = process.env.RSSHUB_BASE || RSSHUB_BASE || 'https://rsshub.app';
  const mirror =
    process.env.RSSHUB_MIRROR || RSSHUB_MIRROR || 'https://rsshub.moeyy.cn';

  return paths.flatMap(p => [`${base}${p}`, `${mirror}${p}`]);
}

async function parseURLWithRetries(candidates, { retries = 2 } = {}) {
  let lastErr;
  for (const url of candidates) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await parser.parseURL(url);
      } catch (e) {
        lastErr = e;
        const status = e?.statusCode || e?.code || '';
        if (
          status === 403 ||
          status === 429 ||
          status === 'ECONNRESET' ||
          status === 'ETIMEDOUT'
        ) {
          await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
          continue;
        }
        break;
      }
    }
  }
  throw lastErr || new Error('All candidates failed');
}

export async function fetchFeed(pathOrUrl) {
  const candidates = buildCandidates(pathOrUrl);
  return parseURLWithRetries(candidates, { retries: 2 });
}
