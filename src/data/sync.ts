import SyncWorker from "worker-loader!./sync.worker"; // eslint-disable-line import/no-webpack-loader-syntax
import { localForage } from "../config/localforage";

function doSync(action: string) {
  return new Promise((resolve, reject) => {
    const worker = new SyncWorker();

    function handleSyncWorkerMessage(evt: MessageEvent) {
      if (evt.data.syncStatus === "success") {
        console.log(`[${action}] Sync success`);
        resolve();
      } else {
        console.error(`[${action}] Sync error`);
        reject();
      }

      worker.terminate();
    }

    worker.onerror = err => console.error(err);
    worker.onmessage = evt => handleSyncWorkerMessage(evt);

    worker.postMessage({ action });
  });
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
  return new Promise(r => setTimeout(r, ms));
}
