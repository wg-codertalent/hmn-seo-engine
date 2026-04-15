// Picks the right backend at runtime.
import * as sheet from "./sheet.js";
import * as queue from "./queue.js";

const backend = sheet.isConfigured() ? sheet : queue;
export const storeName = sheet.isConfigured() ? "Google Sheets" : "JSON fallback";
export const getRows = backend.getRows;
export const appendRows = backend.appendRows;
export const tabUrl = backend.tabUrl;
