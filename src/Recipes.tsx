import * as React from "react";

import { Link } from "react-router-dom";
import { getRecipes, IRecipe } from "./data";

interface IRecipeState {
  searchTerm: string;
  recipes: IRecipe[];
}

class Recipes extends React.Component<{}, IRecipeState> {
  public state: IRecipeState = {
    searchTerm: "",
    recipes: []
  };

  public async componentDidMount() {
    await this.getRecipes("");
  }

  public async getRecipes(query = "") {
    const recipes = await getRecipes({ query });

    this.setState({ recipes });
  }

  public async componentDidUpdate(prevProps: {}, prevState: IRecipeState) {
    if (prevState.searchTerm !== this.state.searchTerm) {
      await this.getRecipes(this.state.searchTerm);
    }
  }

  public render() {
    const displayedRecipes = this.state.recipes;

    return (
      <div className="Page">
        <header className="PageHeader">
          <label className="HiddenLabel" htmlFor="ffxii-RecipesSearchInput">
            Search for recipes
          </label>
          <input
            id="ffxii-RecipesSearchInput"
            className="HeadingSearchInput"
            placeholder="eg: 'Assorted Leathers'"
            type="search"
            value={this.state.searchTerm}
            onChange={this.handleSearchTermChange}
          />

          <span className="HeadingSearchFeedback">
            Found {displayedRecipes.length} recipes.
          </span>
        </header>

        <div className="PageContents">
          {displayedRecipes.length > 0 ? (
            <div className="CustomList FullWidth">
              {displayedRecipes.map(r => (
                <Link
                  to={`/recipes/${r._id}`}
                  key={r._id}
                  className="CustomListItem"
                >
                  <span className={"CustomListItemLabel"}>{r.name}</span>
                  {(r.repeatable || r.done) && (
                    <span className="CustomListItemBadge">
                      {r.repeatable && "♻️"}
                      {r.done && "✔️"}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="NoResultsFeedback">Nothing.</div>
          )}
        </div>
      </div>
    );
  }

  private handleSearchTermChange = (
    e: React.SyntheticEvent<HTMLInputElement>
  ) =>
    this.setState({
      searchTerm: e.currentTarget.value
    });
}

export { Recipes };
