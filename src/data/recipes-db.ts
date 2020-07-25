import "../config/db-config";

import PouchDB from "pouchdb-browser";

import { IRecipe } from "./api-types";
import { localForage } from "../config/localforage";
import { syncIds } from "./db";

export const recipesDb = new PouchDB<IRecipe>("ffxii_bazaar_recipes", {
  adapter: "idb",
  revs_limit: 1,
});

const baseUrl = process.env.PUBLIC_URL!;

interface IJsonData<T> {
  version: number;
  data: T;
}

export async function syncRecipes() {
  try {
    // Always fetch the latest data.
    const response = await fetch(`${baseUrl}/recipes.json?_=${Date.now()}`);

    if (response.ok) {
      const data: IJsonData<IRecipe[]> = await response.json();

      await localForage.ready();

      if (data.version === (await localForage.getItem("recipes_version"))) {
        console.log("[recipes] Data is up-to date.");
        return { updated: false, version: data.version };
      }

      await recipesDb.createIndex({ index: { fields: ["name"] } });
      await recipesDb.createIndex({ index: { fields: ["items"] } });
      await recipesDb.createIndex({ index: { fields: ["result"] } });

      // Used later to remove recipes which are no longer in the file.
      const newIds = [];

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

        newIds.push(recipe._id);
      }

      await syncIds(recipesDb, newIds);

      await localForage.setItem("recipes_version", data.version);

      return { updated: true, version: data.version };
    } else {
      throw response;
    }
  } catch (e) {
    // TODO Handle error.
    console.error(e);
  }
}
