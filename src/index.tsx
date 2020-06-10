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

import App from "./App";

// import { register } from "./serviceWorker";

ReactDOM.render(<App />, document.getElementById("root"));
// register();

runSync();

WebFont.load({
  google: {
    families: ["Open Sans", "Source Sans Pro"]
  }
});
