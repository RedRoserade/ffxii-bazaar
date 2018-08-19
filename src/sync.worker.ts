import { syncItems, syncRecipes } from "./db";

async function sync() {
  await syncItems();
  await syncRecipes();
}

addEventListener("message", async evt => {
  const data = evt.data || {};

  if (typeof data === "object" && data.action === "sync") {
    try {
      await sync();
      postMessage({ syncStatus: "success" });
    } catch (e) {
      console.error("Failed to sync", e);
      postMessage({ syncStatus: "error" });
    }
  } else {
    console.warn("Unknown payload", data);
  }
});
