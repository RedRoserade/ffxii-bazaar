import syncWorker from "workerize-loader!./sync.worker"; // eslint-disable-line import/no-webpack-loader-syntax
import { localForage } from "../config/localforage";

export interface SyncResult {
  updated: false;
  version: number;
}

export interface ISyncWorker {
  syncRecipes(): Promise<SyncResult>;
  syncItems(): Promise<SyncResult>;
}

async function doSync(action: "syncRecipes" | "syncItems"): Promise<SyncResult> {
  const worker = syncWorker<ISyncWorker>();

  try {
    switch (action) {
      case "syncRecipes":
        return await worker.syncRecipes();
      case "syncItems":
        return await worker.syncItems();
      default:
        throw new Error(`Unknown action: '${action}', supported are 'syncItems', 'syncRecipes'`);
    }
  } catch (e) {
    console.error(`[${action}] Error`, e);
    return { updated: false, version: 0 };
  } finally {
    worker.terminate();
    console.log(`[${action}] Worker terminated.`);
  }
}

function syncRecipes() {
  return doSync("syncRecipes");
}

function syncItems() {
  return doSync("syncItems");
}

export function runSync() {
  return Promise.all([syncRecipes(), syncItems()]);
}

// The following is a HACK, I need to figure out a better way to get the sync
// and the API workers working together.

let recipesReady = false;
let itemsReady = false;

export async function waitForRecipeData() {
  if (recipesReady) {
    return;
  }

  await waitFor("recipes_version");

  recipesReady = true;
}

export async function waitForItemData() {
  if (itemsReady) {
    return;
  }
  await waitFor("items_version");
  itemsReady = true;
}

async function waitFor(key: string) {
  await localForage.ready();

  let version = await localForage.getItem(key);
  const time = 100;

  while (version == null) {
    await delay(time);
    version = await localForage.getItem(key);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
