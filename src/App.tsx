import * as React from "react";

import { HashRouter, NavLink, Redirect, Route, Switch } from "react-router-dom";

import { ItemDetails } from "./ItemDetails";
import { Items } from "./Items";

import { RecipeDetails } from "./RecipeDetails";
import { Recipes } from "./Recipes";
import { About } from "./About";
// import { syncItems, syncRecipes } from "src/db";

import SyncWorker from "worker-loader!./sync.worker";
import { DataLoading } from "./DataLoading";

interface IAppState {
  syncState: "done" | "syncing" | "error";
}

class App extends React.Component<{}, IAppState> {
  private worker: SyncWorker | null;

  public state: IAppState = {
    syncState: "syncing"
  };

  private handleSyncWorkerMessage(evt: MessageEvent) {
    if (evt.data.syncStatus === "success") {
      this.setState({ syncState: "done" });
    } else {
      this.setState({ syncState: "error" });
    }
  }

  public async componentDidMount() {
    const worker = new SyncWorker();

    worker.onerror = err => console.error(err);
    worker.onmessage = evt => this.handleSyncWorkerMessage(evt);

    worker.postMessage({ action: "sync" });

    this.worker = worker;
  }

  public componentWillUnmount() {
    if (this.worker != null) {
      this.worker.terminate();
    }
  }

  public render() {
    if (this.state.syncState !== "done") {
      return (
        <main className="MainContents">
          <DataLoading />
        </main>
      );
    }

    return (
      <HashRouter>
        <>
          <main className="MainContents">
            <Switch>
              <Route path="/recipes/:id" component={RecipeDetails} />
              <Route path="/recipes" component={Recipes} />

              <Route path="/items/:id" component={ItemDetails} />
              <Route path="/items" component={Items} />

              <Route path="/about" component={About} />

              <Redirect from="/" to="/recipes" />
            </Switch>
          </main>
          <nav className="MainNav">
            <NavLink to="/recipes" replace={true}>
              Recipes
            </NavLink>
            <NavLink to="/items" replace={true}>
              Items
            </NavLink>
            <NavLink to="/about" replace={true}>
              About
            </NavLink>
          </nav>
        </>
      </HashRouter>
    );
  }
}

export default App;
