import PouchDB from "pouchdb-browser";
import localForage from "localforage";
import find from "pouchdb-find";

localForage.config({
  name: "ffxii_bazaar",
  version: 1
});

PouchDB.plugin(find);
