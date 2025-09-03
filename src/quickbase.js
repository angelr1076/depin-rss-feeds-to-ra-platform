import fetch from 'node-fetch';
import { QB } from './config.js';

function cleanRealmHost(host) {
  if (!host) return '';
  return host.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

function qbHeaders() {
  const realmHost = cleanRealmHost(QB.realm);
  return {
    'QB-Realm-Hostname': realmHost,
    Authorization: `QB-USER-TOKEN ${QB.token}`,
    'User-Agent': QB.agent || 'DepinRSSBot/1.0',
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
  return res.json();
}

// Create a field by label + fieldType
export async function createField(label, fieldType = 'text') {
  const url =
    'https://api.quickbase.com/v1/fields?tableId=' +
    encodeURIComponent(QB.tableId);
  const body = { label, fieldType };
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
