import fetch from 'node-fetch';
import { QB } from './config.js';

function qbHeaders() {
  return {
    'QB-Realm-Hostname': QB.realm,
    Authorization: `QB-USER-TOKEN ${QB.token}`,
    'User-Agent': QB.agent,
    'Content-Type': 'application/json',
  };
}

// Get fields to map names => fieldId
export async function getFields() {
  const url =
    'https://api.quickbase.com/v1/fields?tableId=' +
    encodeURIComponent(QB.tableId);
  const res = await fetch(url, { headers: qbHeaders() });
  if (!res.ok) throw new Error(`getFields failed: ${res.status}`);
  return res.json(); // array of fields {id,label,...}
}

// Create a field by label + type
export async function createField(label, type = 'text') {
  const url =
    'https://api.quickbase.com/v1/fields?tableId=' +
    encodeURIComponent(QB.tableId);
  const body = { label, type };
  const res = await fetch(url, {
    method: 'POST',
    headers: qbHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`createField failed: ${res.status}`);
  return res.json();
}

// Upsert records (insert/update)
export async function upsert({ data, mergeFieldId }) {
  const url = 'https://api.quickbase.com/v1/records';
  const body = {
    to: QB.tableId,
    data,
    ...(mergeFieldId ? { mergeFieldId } : {}),
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: qbHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`upsert failed: ${res.status} ${text}`);
  }
  return res.json();
}
