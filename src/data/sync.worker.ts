import { syncRecipes } from "src/data/recipes-db";
import { syncItems } from "src/data/items-db";
import { syncRecipeItems } from "src/data/recipe-items-db";

addEventListener("message", async evt => {
  const data = evt.data || {};

  const worker: Worker = self as any;

  if (typeof data === "object") {
    try {
      switch (data.action) {
        case "syncRecipes":
          await syncRecipes();
          break;
        case "syncItems":
          await syncItems();
          break;
        case "syncRecipeItems":
          await syncRecipeItems();
          break;
        default:
          console.warn("Unknown action", data.action);
          return;
      }
      worker.postMessage({ syncStatus: "success" });
    } catch (e) {
      console.error("Failed to sync", e);
      worker.postMessage({ syncStatus: "error" });
    }
  } else {
    console.warn("Unknown payload", data);
  }
});
