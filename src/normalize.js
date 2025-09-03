import crypto from 'node:crypto';

export function normalizeItems(feed, sourceName, feedUrl) {
  const nowIso = new Date().toISOString();
  return (feed.items || []).map(item => {
    const guid =
      item.guid ||
      item.id ||
      item.link ||
      `${item.title}-${item.pubDate || ''}`;
    const basis = `${sourceName}|${item.link || ''}|${
      item.title || ''
    }|${guid}`;
    const hash = crypto.createHash('sha256').update(basis).digest('hex');

    return {
      Source: sourceName,
      FeedURL: feedUrl,
      Title: item.title || '',
      Link: item.link || '',
      Author: item.creator || item.author || '',
      PublishedAt: item.isoDate || item.pubDate || null,
      Summary: item.contentSnippet || item.content || '',
      Tags: Array.isArray(item.categories) ? item.categories.join(',') : '',
      GUID: guid,
      ItemHash: hash,
      FetchedAt: nowIso,
    };
  });
}
