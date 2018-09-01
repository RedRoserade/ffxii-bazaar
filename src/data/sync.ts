import SyncWorker from "worker-loader!src/data/sync.worker";
import { localForage } from "src/config/localforage";

function doSync(action: string) {
  return new Promise((resolve, reject) => {
    function handleSyncWorkerMessage(evt: MessageEvent) {
      if (evt.data.syncStatus === "success") {
        console.log(`[${action}] Sync success`);
        resolve();
      } else {
        console.error(`[${action}] Sync error`);
        reject();
      }
    }

    const worker = new SyncWorker();

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
  let time = 50;

  while (version == null) {
    await delay(time);
    version = await localForage.getItem(key);
    time *= 2;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
