import "src/index.css";
import "react-virtualized/styles.css";

import "src/config/localforage";

// Init the API worker ASAP.
import "src/data/api-worker";
import { runSync } from "src/data/sync";

import "src/config/font-awesome";

import React from "react";
import ReactDOM from "react-dom";

import WebFont from "webfontloader";

import App from "src/App";

import registerServiceWorker from "./registerServiceWorker";

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();

runSync();

WebFont.load({
  google: {
    families: ["Open Sans", "Source Sans Pro"]
  }
});
