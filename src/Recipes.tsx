import React from "react";

import { Link, RouteComponentProps } from "react-router-dom";
import { apiWorker } from "src/data/api-worker";
import { IRecipe } from "src/data/api-types";
import { debounce } from "lodash-es";
import { RecipeStatus } from "src/RecipeStatus";
import { InfiniteLoader, AutoSizer, List } from "react-virtualized";
import { LoadState } from "src/util";
import { LoadingPlaceholderSpinner } from "src/LoadingPlaceholder";

interface IRecipeState {
  recipes: IRecipe[];
  loadState: LoadState;
}

class Recipes extends React.Component<RouteComponentProps<{}>, IRecipeState> {
  constructor(props: RouteComponentProps<{}>) {
    super(props);

    this.state = {
      recipes: [],
      loadState: "loading"
    };
  }

  private getSearchTerm(): string {
    const params = new URLSearchParams(this.props.location.search.substr(1));

    const searchTerm = params.get("search") || "";

    return searchTerm;
  }

  public async componentDidMount() {
    await this.getRecipes(this.getSearchTerm());
  }

  public getRecipes = debounce(async (query = "", skip = 0, limit = 30) => {
    this.setState({ loadState: "loading" });

    const recipes = await apiWorker.getRecipes({ query, skip, limit });

    this.setState({ recipes, loadState: "success" });
  }, 100);

  public async componentDidUpdate(prevProps: RouteComponentProps<{}>) {
    if (prevProps.location.search !== this.props.location.search) {
      await this.getRecipes(this.getSearchTerm());
    }
  }

  public render() {
    return (
      <div className="Page">
        <SearchHeader
          searchTerm={this.getSearchTerm()}
          onSearchTermChange={this.handleSearchTermChange}
        />

        {this.state.loadState === "loading" &&
        this.state.recipes.length === 0 ? (
          <LoadingPlaceholderSpinner timeout={300} />
        ) : (
          <div className="PageContents WithVirtualizedScrollList">
            <InfiniteLoader
              isRowLoaded={this.isRowLoaded}
              loadMoreRows={this.loadMoreRows}
              rowCount={Infinity}
              minimumBatchSize={30}
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
        )}
      </div>
    );
  }

  private handleSearchTermChange = (
    e: React.SyntheticEvent<HTMLInputElement>
  ) => {
    const query = e.currentTarget.value;

    if (query) {
      this.props.history.replace(
        `${this.props.match.path}?search=${encodeURIComponent(query)}`
      );
    } else {
      this.props.history.replace(this.props.match.path);
    }
  };

  private isRowLoaded = (options: { index: number }) =>
    this.state.recipes.length > options.index;

  private loadMoreRows = async (options: {
    startIndex: number;
    stopIndex: number;
  }) => {
    if (this.state.loadState === "loading") {
      return;
    }

    this.setState({ loadState: "loading" });

    const result = await apiWorker.getRecipes({
      query: this.getSearchTerm(),
      skip: options.startIndex,
      limit: options.stopIndex - options.startIndex + 1
    });

    this.setState(state => ({
      recipes: state.recipes.concat(result),
      loadState: "success"
    }));
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

function SearchHeader(props: {
  searchTerm: string;
  onSearchTermChange(e: React.SyntheticEvent): void;
}) {
  return (
    <header className="PageHeader">
      <div className="PageHeaderRow">
        <label className="HiddenLabel" htmlFor="ffxii-RecipesSearchInput">
          Search for recipes
        </label>
        <input
          id="ffxii-RecipesSearchInput"
          className="HeadingSearchInput"
          placeholder="eg: 'Assorted Leathers'"
          type="search"
          value={props.searchTerm}
          onInput={props.onSearchTermChange}
          onFocus={e => e.currentTarget.select()}
        />

        {/* <span className="HeadingSearchFeedback">
            Found {displayedRecipes.length} recipes.
          </span> */}
      </div>
    </header>
  );
}
