import Parser from 'rss-parser';
import { RSSHUB_BASE } from './config.js';

const parser = new Parser();

export async function fetchFeed(pathOrUrl) {
  const url = pathOrUrl.startsWith('http')
    ? pathOrUrl
    : `${RSSHUB_BASE}${pathOrUrl}`;

  return parser.parseURL(url); // Title, items[], etc.
}
