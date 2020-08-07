import "../config/db-config";

import PouchDB from "pouchdb-browser";

import { IItem } from "./api-types";
import { localForage } from "../config/localforage";
import { syncIds } from "./db";

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
    const structureVersion = 2;

    // Always fetch the latest data.
    const response = await fetch(`${baseUrl}/items.json?_v=${Date.now()}`);

    if (!response.ok) {
      throw response;
    }
    const data: IJsonData<IItem[]> = await response.json();

    await localForage.ready();

    const isDataUpToDate = data.version === (await localForage.getItem<number>("items_version"));
    const isStructureUpToDate = structureVersion === (await localForage.getItem<number>("items_version_structure"));

    if (isDataUpToDate && isStructureUpToDate) {
      console.log("[items] Data is up-to date. Version", data.version);
      return { updated: false, version: data.version };
    }

    if (!isStructureUpToDate) {
      await itemsDb.createIndex({ index: { fields: ["name"] } });
      await itemsDb.createIndex({ index: { fields: ["index"] } });

      await localForage.setItem("items_version_structure", structureVersion);
    }

    if (!isDataUpToDate) {
      const newIds = [];

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

        newIds.push(item._id);
      }

      await syncIds(itemsDb, newIds);

      await localForage.setItem("items_version", data.version);
    }

    return { updated: true, version: data.version };
  } catch (e) {
    // TODO Handle error.
    console.error(e);
  }
}
