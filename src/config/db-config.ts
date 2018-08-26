import PouchDB from "pouchdb-browser";
import find from "pouchdb-find";

import localForage from "localforage";

localForage.config({
  name: "ffxii_bazaar",
  version: 1
});

PouchDB.plugin(find);
