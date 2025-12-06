import crypto from 'node:crypto';

export function normalizeItems(feed, sourceName, feedUrl) {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 2); // No older than 2 months ago
  let items = feed.items || [];

  if (
    config.maxItems &&
    Number.isInteger(config.maxItems) &&
    config.maxItems > 0
  ) {
    items = items.slice(0, config.maxItems);
  }

  return items
    .map(item => {
      const guid =
        item.guid ||
        item.id ||
        item.link ||
        `${item.title}-${item.pubDate || ''}`;
      const basis = `${sourceName}|${item.link || ''}|${
        item.title || ''
      }|${guid}`;
      const hash = crypto.createHash('sha256').update(basis).digest('hex');

      const published = item.isoDate
        ? new Date(item.isoDate)
        : item.pubDate
        ? new Date(item.pubDate)
        : null;

      return {
        Source: sourceName,
        FeedURL: feedUrl,
        Title: item.title || '',
        Link: item.link || '',
        Author: item.creator || item.author || '',
        PublishedAt: published ? published.toISOString() : null,
        Summary: item.contentSnippet || item.content || '',
        Tags: Array.isArray(item.categories) ? item.categories.join(',') : '',
        GUID: guid,
        ItemHash: hash,
        FetchedAt: now.toISOString(),
      };
    })
    .filter(it => {
      if (!it.PublishedAt) return true;
      return new Date(it.PublishedAt) >= cutoff;
    });
}
