import "./index.css";
import "react-virtualized/styles.css";

import "./config/localforage";

// Init the API worker ASAP.
import "./data/api-worker";
import { runSync } from "./data/sync";

import "./config/font-awesome";

import React from "react";
import ReactDOM from "react-dom";

import WebFont from "webfontloader";

import { register } from "./serviceWorker";

import App from "./App";
import { appUpdateSubject$ } from "./app-update";

ReactDOM.render(<App />, document.getElementById("root"));

if (process.env.NODE_ENV === "production") {
  register();
}

runSync().then((result) => {
  console.log("Sync complete");

  if (result.some((r) => r.updated)) {
    appUpdateSubject$.next("dataUpdated");
  }
});

WebFont.load({
  google: {
    families: ["Open Sans", "Source Sans Pro"],
  },
});
