import { getFields, createField } from './quickbase.js';

// Table schema
export const REQUIRED_FIELDS = {
  Source: 'text',
  FeedURL: 'text',
  Title: 'text',
  Link: 'url',
  Author: 'text',
  PublishedAt: 'timestamp',
  Summary: 'text-multi-line',
  Tags: 'text',
  GUID: 'text',
  ItemHash: 'text', // Upserts based on ItemHash
  FetchedAt: 'timestamp',
};

export async function ensureFieldsAndMapIds() {
  const existing = await getFields();
  const arr = Array.isArray(existing.fields) ? existing.fields : existing;
  const byLabel = new Map(arr.map(f => [f.label, f]));

  // Create any missing
  for (const [label, fieldType] of Object.entries(REQUIRED_FIELDS)) {
    if (!byLabel.has(label)) {
      const created = await createField(label, fieldType);
      byLabel.set(created.label || label, created);
    }
  }

  // Build name => id map
  const fresh = await getFields();
  const list = Array.isArray(fresh.fields) ? fresh.fields : fresh;
  const idMap = {};
  for (const [label] of Object.entries(REQUIRED_FIELDS)) {
    const f = list.find(x => x.label === label);
    if (!f) throw new Error(`Field still missing: ${label}`);
    idMap[label] = f.id;
  }
  return idMap;
}
