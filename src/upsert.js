import { upsert } from './quickbase.js';

export function toQbRows(items, idMap) {
  return items.map(it => {
    const row = {};
    for (const [k, v] of Object.entries(it)) {
      const fid = idMap[k];
      if (!fid) continue;
      row[fid] = { value: v ?? null };
    }
    return row;
  });
}

export async function upsertItems(items, idMap) {
  const data = toQbRows(items, idMap);
  const mergeFieldId = idMap['ItemHash']; // De-dupe key
  return upsert({ data, mergeFieldId });
}
