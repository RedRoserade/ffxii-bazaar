import SyncWorker from "worker-loader!src/data/sync.worker";

export function runSync() {
  return new Promise((resolve, reject) => {
    function handleSyncWorkerMessage(evt: MessageEvent) {
      if (evt.data.syncStatus === "success") {
        console.log("Sync success");
        resolve();
      } else {
        console.error("Sync error");
        reject();
      }
    }

    const worker = new SyncWorker();

    worker.onerror = err => console.error(err);
    worker.onmessage = evt => handleSyncWorkerMessage(evt);

    worker.postMessage({ action: "sync" });
  });
}
