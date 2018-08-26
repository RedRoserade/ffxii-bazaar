import * as React from "react";

import { Link } from "react-router-dom";
import { getRecipes, IRecipe } from "./data/api";
import { debounce } from "lodash-es";
import { RecipeStatus } from "./RecipeStatus";
import { InfiniteLoader, AutoSizer, List } from "react-virtualized";
import {
  getRecipeSearchTerm,
  clearRecipeSearchTerm,
  persistRecipeSearchTerm
} from "./data/search-term-persistence";
import { localForage } from "./config/localforage";
import { recipeSync$ } from "src/data/sync";
import { first } from "rxjs/operators";

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
    await localForage.ready();

    const recipeVersion = await localForage.getItem("recipes_version");

    if (recipeVersion == null) {
      console.log("Waiting...");
      await recipeSync$.pipe(first(x => x === "success")).toPromise();
      console.log("Done.");
    }

    const persistedSearchTerm = getRecipeSearchTerm();

    if (persistedSearchTerm != null) {
      this.setState({ searchTerm: persistedSearchTerm });
      clearRecipeSearchTerm();
    } else {
      await this.getRecipes("");
    }
  }

  public getRecipes = debounce(async (query = "", skip = 0, limit = 30) => {
    const recipes = await getRecipes({ query, skip, limit });

    this.setState({ recipes });
  }, 100);

  public async componentDidUpdate(prevProps: {}, prevState: IRecipeState) {
    if (prevState.searchTerm !== this.state.searchTerm) {
      await this.getRecipes(this.state.searchTerm);

      if (this.state.searchTerm) {
        persistRecipeSearchTerm(this.state.searchTerm);
      } else {
        clearRecipeSearchTerm();
      }
    }
  }

  public render() {
    // const displayedRecipes = this.state.recipes;

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
            onFocus={e => e.currentTarget.select()}
          />

          {/* <span className="HeadingSearchFeedback">
            Found {displayedRecipes.length} recipes.
          </span> */}
        </header>

        <div className="PageContents WithVirtualizedScrollList">
          <InfiniteLoader
            isRowLoaded={this.isRowLoaded}
            loadMoreRows={this.loadMoreRows}
            rowCount={Infinity}
          >
            {({ onRowsRendered, registerChild }) => (
              <AutoSizer>
                {({ width, height }) => (
                  <List
                    ref={registerChild}
                    height={height}
                    onRowsRendered={onRowsRendered}
                    rowCount={this.state.recipes.length}
                    rowHeight={43}
                    rowRenderer={this.renderRow}
                    width={width}
                  />
                )}
              </AutoSizer>
            )}
          </InfiniteLoader>
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

  private isRowLoaded = (options: { index: number }) =>
    this.state.recipes.length > options.index;

  private loadMoreRows = async (options: {
    startIndex: number;
    stopIndex: number;
  }) => {
    const result = await getRecipes({
      query: this.state.searchTerm,
      skip: options.startIndex,
      limit: options.stopIndex - options.startIndex + 1
    });

    this.setState(state => ({ recipes: state.recipes.concat(result) }));
  };

  private renderRow = (options: { index: number; key: any; style: any }) => {
    const r = this.state.recipes[options.index];

    return (
      <Link
        to={`/recipes/${r._id}`}
        key={options.key}
        className="CustomListItem"
        style={options.style}
      >
        <span className={"CustomListItemLabel"}>{r.name}</span>
        {(r.repeatable || r.done) && (
          <span className="CustomListItemBadge">
            <RecipeStatus recipe={r} />
          </span>
        )}
      </Link>
    );
  };
}

export { Recipes };
