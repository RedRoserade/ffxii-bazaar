import PouchDB from "pouchdb-browser";
import find from "pouchdb-find";

import { IItem, IRecipe } from "./data";

PouchDB.plugin(find);

const itemsDb = new PouchDB<IItem>("ffxii_bazaar_items", {
  adapter: "idb",
  revs_limit: 1
});

const recipesDb = new PouchDB<IRecipe>("ffxii_bazaar_recipes", {
  adapter: "idb",
  revs_limit: 1
});

export { itemsDb, recipesDb };

const baseUrl = process.env.PUBLIC_URL!;

interface IJsonData<T> {
  version: number;
  data: T;
}

export async function syncItems() {
  try {
    const response = await fetch(`${baseUrl}/items.json`);

    if (response.ok) {
      const data: IJsonData<IItem[]> = await response.json();

      if (
        data.version === parseInt(localStorage.getItem("items_version")!, 10)
      ) {
        console.log("Data is up-to date.");
        return;
      }

      await itemsDb.createIndex({ index: { fields: ["name"] } });

      for (const item of data.data) {
        // console.debug("Processing item", item._id);
        try {
          const existing = await itemsDb.get(item._id);

          // Do an update.
          Object.assign(existing, item);

          await itemsDb.put(existing);

          // console.debug("Item", item._id, "updated.");
        } catch (err) {
          if (err.name === "not_found") {
            // Doesn't exist, add.
            await itemsDb.put(item);

            // console.debug("Item", item._id, "created.");
          } else {
            // Some other error.
            throw err;
          }
        }
      }

      localStorage.setItem("items_version", "" + data.version);
    } else {
      // TODO Handle error.
    }
  } catch (e) {
    // TODO Handle error.
    console.error(e);
  }
}

export async function syncRecipes() {
  try {
    const response = await fetch(`${baseUrl}/recipes.json`);

    if (response.ok) {
      const data: IJsonData<IRecipe[]> = await response.json();

      if (
        data.version === parseInt(localStorage.getItem("recipes_version")!, 10)
      ) {
        console.log("Data is up-to date.");
        return;
      }

      await recipesDb.createIndex({ index: { fields: ["name"] } });

      for (const recipe of data.data) {
        // console.debug("Processing recipe", recipe._id);
        try {
          const existing = await recipesDb.get(recipe._id);

          // Do an update.
          Object.assign(existing, recipe);

          await recipesDb.put(existing);

          // console.debug("Recipe", recipe._id, "updated.");
        } catch (err) {
          if (err.name === "not_found") {
            // Doesn't exist, add.
            await recipesDb.put(recipe);

            // console.debug("Recipe", recipe._id, "created.");
          } else {
            // Some other error.
            throw err;
          }
        }
      }

      localStorage.setItem("recipes_version", "" + data.version);
    } else {
      // TODO Handle error.
    }
  } catch (e) {
    // TODO Handle error.
    console.error(e);
  }
}
