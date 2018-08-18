import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";

import "./index.css";
import { unregister } from "./registerServiceWorker";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

library.add(faChevronLeft);

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
// registerServiceWorker();
unregister();
