import RecipeSyncWorker from "worker-loader!src/data/recipe-sync.worker";
import ItemSyncWorker from "worker-loader!src/data/item-sync.worker";
import { Subject } from "rxjs";

type SyncStatus = "pending" | "syncing" | "success" | "error";

export const itemSync$ = new Subject<SyncStatus>();
export const recipeSync$ = new Subject<SyncStatus>();

function syncRecipes() {
  return new Promise((resolve, reject) => {
    function handleSyncWorkerMessage(evt: MessageEvent) {
      if (evt.data.syncStatus === "success") {
        console.log("[Recipes] Sync success");
        resolve();
        recipeSync$.next("success");
      } else {
        console.error("[Recipes] Sync error");
        reject();
        recipeSync$.next("error");
      }
    }

    const worker = new RecipeSyncWorker();

    worker.onerror = err => console.error(err);
    worker.onmessage = evt => handleSyncWorkerMessage(evt);

    worker.postMessage({ action: "sync" });

    recipeSync$.next("syncing");
  });
}

function syncItems() {
  return new Promise((resolve, reject) => {
    function handleSyncWorkerMessage(evt: MessageEvent) {
      if (evt.data.syncStatus === "success") {
        console.log("[Items] Sync success");
        resolve();
        itemSync$.next("success");
      } else {
        console.error("[Items] Sync error");
        reject();
        itemSync$.next("error");
      }
    }

    const worker = new ItemSyncWorker();

    worker.onerror = err => console.error(err);
    worker.onmessage = evt => handleSyncWorkerMessage(evt);

    worker.postMessage({ action: "sync" });

    itemSync$.next("syncing");
  });
}

export function runSync() {
  return Promise.all([syncRecipes(), syncItems()]);
}
