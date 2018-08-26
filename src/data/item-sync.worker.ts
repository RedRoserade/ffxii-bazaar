import { syncItems } from "src/data/items-db";

async function sync() {
  await syncItems();
}

addEventListener("message", async evt => {
  const data = evt.data || {};

  const worker: Worker = self as any;

  if (typeof data === "object" && data.action === "sync") {
    try {
      await sync();
      worker.postMessage({ syncStatus: "success" });
    } catch (e) {
      console.error("Failed to sync", e);
      worker.postMessage({ syncStatus: "error" });
    }
  } else {
    console.warn("Unknown payload", data);
  }
});
