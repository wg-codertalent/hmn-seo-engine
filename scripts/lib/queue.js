// JSON fallback backend. Implements the same interface as lib/sheet.js
// so the scripts don't care which storage is active.
import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.resolve("data");
const FILES = {
  Ideas:    path.join(DATA_DIR, "content-ideas.json"),
  Articles: path.join(DATA_DIR, "content-queue.json")
};

async function readFile(name) {
  try {
    return JSON.parse(await fs.readFile(FILES[name], "utf8"));
  } catch {
    return [];
  }
}

async function writeFile(name, rows) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILES[name], JSON.stringify(rows, null, 2) + "\n");
}

class Row {
  constructor(name, rows, index) {
    this._name = name;
    this._rows = rows;
    this._index = index;
  }
  get(k) { return this._rows[this._index][k]; }
  toJSON() { return { ...this._rows[this._index] }; }
  async update(updates) {
    Object.assign(this._rows[this._index], updates);
    await writeFile(this._name, this._rows);
  }
}

export async function getRows(name) {
  const rows = await readFile(name);
  return rows.map((_, i) => new Row(name, rows, i));
}

export async function appendRows(name, records) {
  if (!records.length) return;
  const rows = await readFile(name);
  rows.push(...records);
  await writeFile(name, rows);
}

export async function tabUrl() { return null; }

export function isConfigured() { return true; }
