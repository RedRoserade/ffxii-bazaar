import "../config/db-config";

import PouchDB from "pouchdb-browser";

import { IItem } from "./api-types";
import { localForage } from "../config/localforage";

const baseUrl = process.env.PUBLIC_URL!;

interface IJsonData<T> {
  version: number;
  data: T;
}

export const itemsDb = new PouchDB<IItem>("ffxii_bazaar_items", {
  adapter: "idb",
  revs_limit: 1,
});

export async function syncItems() {
  try {
    const response = await fetch(`${baseUrl}/items.json`);

    if (response.ok) {
      const data: IJsonData<IItem[]> = await response.json();

      await localForage.ready();

      if (data.version === (await localForage.getItem<number>("items_version"))) {
        console.log("[items] Data is up-to date.");
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

      await localForage.setItem("items_version", data.version);
    } else {
      throw response;
    }
  } catch (e) {
    // TODO Handle error.
    console.error(e);
  }
}
