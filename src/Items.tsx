import * as React from "react";

import { Link } from "react-router-dom";
import { IItem, getItems } from "./data/api";
import { ItemIcon } from "./ItemTypeIcon";
import { debounce } from "lodash-es";
import { InfiniteLoader, AutoSizer, List } from "react-virtualized";
import {
  persistItemSearchTerm,
  clearItemSearchTerm,
  getItemSearchTerm
} from "src/data/search-term-persistence";
import { localForage } from "src/config/localforage";
import { itemSync$ } from "./data/sync";
import { first } from "rxjs/operators";

interface IItemsState {
  searchTerm: string;
  items: IItem[];
}

class Items extends React.Component<{}, IItemsState> {
  public state: IItemsState = {
    searchTerm: "",
    items: []
  };

  public async componentDidMount() {
    const recipeVersion = await localForage.getItem("items_version");

    if (recipeVersion == null) {
      console.log("Waiting...");
      await itemSync$.pipe(first(x => x === "success")).toPromise();
      console.log("Done.");
    }

    const persistedSearchTerm = getItemSearchTerm();

    if (persistedSearchTerm != null) {
      this.setState({ searchTerm: persistedSearchTerm });
      clearItemSearchTerm();
    } else {
      await this.getItems("");
    }
  }

  public getItems = debounce(async (query = "", skip = 0, limit = 30) => {
    const items = await getItems({ query, skip, limit });

    this.setState({ items });
  }, 100);

  public async componentDidUpdate(prevProps: {}, prevState: IItemsState) {
    if (prevState.searchTerm !== this.state.searchTerm) {
      await this.getItems(this.state.searchTerm);

      if (this.state.searchTerm) {
        persistItemSearchTerm(this.state.searchTerm);
      } else {
        clearItemSearchTerm();
      }
    }
  }

  public render() {
    // const displayedItems = this.state.items;

    return (
      <div className="Page">
        <header className="PageHeader">
          <label className="HiddenLabel" htmlFor="ffxii-ItemsSearchInput">
            Search for items
          </label>
          <input
            id="ffxii-ItemsSearchInput"
            className="HeadingSearchInput"
            placeholder="eg: 'Wolf Pelt'"
            type="text"
            value={this.state.searchTerm}
            onChange={this.handleSearchTermChange}
            onFocus={e => e.currentTarget.select()}
          />
          {/* <span className="HeadingSearchFeedback">
            Found {displayedItems.length} items.
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
                    rowCount={this.state.items.length}
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
    this.state.items.length > options.index;

  private loadMoreRows = async (options: {
    startIndex: number;
    stopIndex: number;
  }) => {
    const result = await getItems({
      query: this.state.searchTerm,
      skip: options.startIndex,
      limit: options.stopIndex - options.startIndex + 1
    });

    this.setState(state => ({ items: state.items.concat(result) }));
  };

  private renderRow = (options: { index: number; key: any; style: any }) => {
    const i = this.state.items[options.index];

    return (
      <Link
        to={`/items/${i._id}`}
        key={options.key}
        className="CustomListItem"
        style={options.style}
      >
        <ItemIcon item={i} />
        &nbsp;
        {i.name}
      </Link>
    );
  };
}

export { Items };
