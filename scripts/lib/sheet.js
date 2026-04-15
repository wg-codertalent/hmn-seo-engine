import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export function isConfigured() {
  return !!(process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.GOOGLE_SHEET_ID);
}

let docPromise;
async function getDoc() {
  if (docPromise) return docPromise;
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const jwt = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt);
  docPromise = doc.loadInfo().then(() => doc);
  return docPromise;
}

async function tab(name) {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[name];
  if (!sheet) throw new Error(`Sheet tab "${name}" not found`);
  return sheet;
}

export async function getRows(name) {
  const sheet = await tab(name);
  const rows = await sheet.getRows();
  return rows.map((r) => new RowProxy(r));
}

export async function appendRows(name, records) {
  if (!records.length) return;
  const sheet = await tab(name);
  await sheet.addRows(records);
}

export async function tabUrl(name) {
  const sheet = await tab(name);
  return `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}/edit#gid=${sheet.sheetId}`;
}

class RowProxy {
  constructor(row) { this._row = row; }
  get(k) { return this._row.get(k); }
  toJSON() {
    const out = {};
    for (const h of this._row._worksheet.headerValues) out[h] = this._row.get(h);
    return out;
  }
  async update(updates) {
    for (const [k, v] of Object.entries(updates)) this._row.set(k, v);
    await this._row.save();
  }
}
