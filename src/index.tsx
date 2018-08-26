import "./index.css";

import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";

import registerServiceWorker from "./registerServiceWorker";

import SyncWorker from "worker-loader!src/data/sync.worker";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faChevronLeft, faDatabase } from "@fortawesome/free-solid-svg-icons";

library.add(faChevronLeft, faDatabase);

function handleSyncWorkerMessage(evt: MessageEvent) {
  if (evt.data.syncStatus === "success") {
    console.log("Sync success");
  } else {
    console.error("Sync error");
  }
}

const worker = new SyncWorker();

worker.onerror = err => console.error(err);
worker.onmessage = evt => handleSyncWorkerMessage(evt);

worker.postMessage({ action: "sync" });

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
