import { syncRecipes as _syncRecipes } from "./recipes-db";
import { syncItems as _syncItems } from "./items-db";
// import { syncRecipeItems } from "./data/recipe-items-db";

// I need to export as explicit functions, otherwise workerize-loader will not catch them and won't add them to the worker.
export function syncRecipes() {
  return _syncRecipes();
}
export function syncItems() {
  return _syncItems();
}
