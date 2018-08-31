import "src/config/db-config";

import PouchDB from "pouchdb-browser";

import { IRecipe, IRecipeItemUsage } from "./api";
import { localForage } from "src/config/localforage";

export const recipeItemsDb = new PouchDB<IRecipeItemUsage>(
  "ffxii_bazaar_recipe_items",
  {
    adapter: "idb",
    revs_limit: 1
  }
);

const baseUrl = process.env.PUBLIC_URL!;

interface IJsonData<T> {
  version: number;
  data: T;
}

const versionKey = "recipe_items_version";
export async function syncRecipeItems() {
  try {
    const response = await fetch(`${baseUrl}/recipes.json`);

    if (response.ok) {
      const data: IJsonData<IRecipe[]> = await response.json();

      await localForage.ready();

      if (data.version === (await localForage.getItem(versionKey))) {
        console.log("[recipeItems] Data is up-to date.");
        return;
      }

      await recipeItemsDb.createIndex({ index: { fields: ["item_id"] } });
      await recipeItemsDb.createIndex({ index: { fields: ["recipe_id"] } });
      await recipeItemsDb.createIndex({ index: { fields: ["role"] } });

      for (const recipe of data.data) {
        // console.debug("Processing recipe", recipe._id);
        for (const item of recipe.items) {
          const id = `${recipe._id}_item_${item.item._id}`;

          const usage: IRecipeItemUsage = {
            _id: id,
            recipe_id: recipe._id,
            item_id: item.item._id,
            role: "input",
            quantity: item.quantity
          };

          try {
            const existing = await recipeItemsDb.get(usage._id);

            // Do an update.
            Object.assign(existing, usage);

            await recipeItemsDb.put(existing);
          } catch (err) {
            if (err.name === "not_found") {
              // Doesn't exist, add.
              await recipeItemsDb.put(usage);

              // console.debug("Recipe", recipe._id, "created.");
            } else {
              // Some other error.
              throw err;
            }
          }
        }

        for (const result of recipe.result) {
          const id = `${recipe._id}_result_${result.item._id}`;

          const usage: IRecipeItemUsage = {
            _id: id,
            recipe_id: recipe._id,
            item_id: result.item._id,
            role: "output",
            quantity: result.quantity
          };

          try {
            const existing = await recipeItemsDb.get(usage._id);

            // Do an update.
            Object.assign(existing, usage);

            await recipeItemsDb.put(existing);
          } catch (err) {
            if (err.name === "not_found") {
              // Doesn't exist, add.
              await recipeItemsDb.put(usage);

              // console.debug("Recipe", recipe._id, "created.");
            } else {
              // Some other error.
              throw err;
            }
          }
        }
      }

      await localForage.setItem(versionKey, data.version);
    } else {
      // TODO Handle error.
    }
  } catch (e) {
    // TODO Handle error.
    console.error(e);
  }
}
