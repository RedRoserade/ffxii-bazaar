import * as React from "react";

import { HashRouter, NavLink, Redirect, Route, Switch } from "react-router-dom";

import { UpdateToastDisplay } from "./UpdateToastDisplay";

import { PageLoading } from "./PageLoading";

const RecipeDetails = React.lazy(() => import("./RecipeDetails").then(x => ({ default: x.RecipeDetails })));

const Recipes = React.lazy(() => import("./Recipes").then(x => ({ default: x.Recipes })));

const About = React.lazy(() => import("./About").then(x => ({ default: x.About })));

const ItemDetails = React.lazy(() => import("./ItemDetails").then(x => ({ default: x.ItemDetails })));

const Items = React.lazy(() => import("./Items").then(x => ({ default: x.Items })));

class App extends React.Component {
  public render() {
    return (
      <HashRouter>
        <React.Suspense fallback={<PageLoading />}>
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
          <UpdateToastDisplay />
        </React.Suspense>
      </HashRouter>
    );
  }
}

export default App;
