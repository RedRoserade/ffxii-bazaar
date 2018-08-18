import * as React from "react";

import { HashRouter, NavLink, Redirect, Route, Switch } from "react-router-dom";

import { ItemDetails } from "./ItemDetails";
import { Items } from "./Items";

import { RecipeDetails } from "./RecipeDetails";
import { Recipes } from "./Recipes";
import { About } from "./About";
import { syncItems, syncRecipes } from "src/db";

class App extends React.Component {
  public async componentDidMount() {
    await syncItems();
    await syncRecipes();
  }

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
        </>
      </HashRouter>
    );
  }
}

export default App;
