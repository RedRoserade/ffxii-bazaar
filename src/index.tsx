import "src/index.css";
import "react-virtualized/styles.css";
import "src/config/font-awesome";

import "src/config/localforage";

import * as React from "react";
import * as ReactDOM from "react-dom";

import WebFont from "webfontloader";

import App from "src/App";

import registerServiceWorker from "./registerServiceWorker";

import { runSync } from "src/data/sync";

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();

runSync();

WebFont.load({
  google: {
    families: ["Open Sans", "Source Sans Pro"]
  }
});
