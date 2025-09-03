import 'dotenv/config';

export const QB = {
  realm: process.env.QB_REALM,
  token: process.env.QB_TOKEN,
  tableId: process.env.QB_TABLE_ID,
  agent: process.env.QB_AGENT || 'DepinRSSBot/1.0',
};

export const RSSHUB_BASE = (
  process.env.RSSHUB_BASE || 'https://rsshub.app'
).replace(/\/+$/, '');
