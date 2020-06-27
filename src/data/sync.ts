import syncWorker from "workerize-loader!./sync.worker"; // eslint-disable-line import/no-webpack-loader-syntax
import { localForage } from "../config/localforage";

export interface ISyncWorker {
  syncRecipes(): Promise<void>;
  syncItems(): Promise<void>;
}

async function doSync(action: "syncRecipes" | "syncItems") {
  const worker = syncWorker<ISyncWorker>();

  try {
    switch (action) {
      case "syncRecipes":
        await worker.syncRecipes();
        break;
      case "syncItems":
        await worker.syncItems();
    }
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

export function waitForRecipeData() {
  return waitFor("recipes_version");
}

export function waitForItemData() {
  return waitFor("items_version");
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
