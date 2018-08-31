import * as React from "react";

import { HashRouter, NavLink, Redirect, Route, Switch } from "react-router-dom";

import { UpdateToastDisplay } from "src/UpdateToastDisplay";

import Loadable from "react-loadable";
import { PageLoading } from "./PageLoading";

const RecipeDetails = Loadable({
  loader: () => import("src/RecipeDetails").then(x => x.RecipeDetails),
  loading: PageLoading,
  timeout: 300
});

const Recipes = Loadable({
  loader: () => import("src/Recipes").then(x => x.Recipes),
  loading: PageLoading,
  timeout: 300
});

const About = Loadable({
  loader: () => import("src/About").then(x => x.About),
  loading: PageLoading,
  timeout: 300
});

const ItemDetails = Loadable({
  loader: () => import("src/ItemDetails").then(x => x.ItemDetails),
  loading: PageLoading,
  timeout: 300
});

const Items = Loadable({
  loader: () => import("src/Items").then(x => x.Items),
  loading: PageLoading,
  timeout: 300
});

class App extends React.Component {
  public render() {
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
          <UpdateToastDisplay />
        </>
      </HashRouter>
    );
  }
}

export default App;
