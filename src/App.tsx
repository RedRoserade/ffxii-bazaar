import * as React from "react";

import { HashRouter, NavLink, Redirect, Route, Switch } from "react-router-dom";

import { ItemDetails } from "./ItemDetails";
import { Items } from "./Items";

import { RecipeDetails } from "./RecipeDetails";
import { Recipes } from "./Recipes";
import { About } from "./About";

class App extends React.Component {
  public render() {
    return (
      <HashRouter>
        <>
          <nav className="MainNav">
            <NavLink to="/recipes">Recipes</NavLink>
            <NavLink to="/items">Items</NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>
          <Switch>
            <Route path="/recipes/:id" component={RecipeDetails} />
            <Route path="/recipes" component={Recipes} />

            <Route path="/items/:id" component={ItemDetails} />
            <Route path="/items" component={Items} />

            <Route path="/about" component={About} />

            <Redirect from="/" to="/recipes" />
          </Switch>
        </>
      </HashRouter>
    );
  }
}

export default App;
