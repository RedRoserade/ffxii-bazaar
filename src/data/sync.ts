import SyncWorker from "worker-loader!src/data/sync.worker";
import { Subject } from "rxjs";
import { first } from "rxjs/operators";
import { localForage } from "src/config/localforage";

type SyncStatus = "pending" | "syncing" | "success" | "error";

export const itemSync$ = new Subject<SyncStatus>();
export const recipeSync$ = new Subject<SyncStatus>();

function doSync(action: string, subject$: Subject<SyncStatus>) {
  return new Promise((resolve, reject) => {
    function handleSyncWorkerMessage(evt: MessageEvent) {
      if (evt.data.syncStatus === "success") {
        console.log(`[${action}] Sync success`);
        resolve();
        subject$.next("success");
      } else {
        console.error(`[${action}] Sync error`);
        reject();
        subject$.next("error");
      }
    }

    const worker = new SyncWorker();

    worker.onerror = err => console.error(err);
    worker.onmessage = evt => handleSyncWorkerMessage(evt);

    worker.postMessage({ action });

    subject$.next("syncing");
  });
}

function syncRecipes() {
  return doSync("syncRecipes", recipeSync$);
}

function syncItems() {
  return doSync("syncItems", itemSync$);
}

export function runSync() {
  return Promise.all([syncRecipes(), syncItems()]);
}

export async function waitForRecipeData() {
  await localForage.ready();

  const recipeVersion = await localForage.getItem("recipes_version");

  if (recipeVersion == null) {
    await recipeSync$.pipe(first(x => x === "success")).toPromise();
  }
}

export async function waitForItemData() {
  await localForage.ready();

  const itemVersion = await localForage.getItem("items_version");

  if (itemVersion == null) {
    await itemSync$.pipe(first(x => x === "success")).toPromise();
  }
}
