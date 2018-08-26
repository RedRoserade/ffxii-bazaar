import * as React from "react";

import { Link } from "react-router-dom";
import { IItem, getItems } from "./data/api";
import { ItemIcon } from "./ItemTypeIcon";
import { debounce } from "lodash-es";
import { InfiniteLoader, AutoSizer, List } from "react-virtualized";

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
    await this.getItems("");
  }

  public getItems = debounce(async (query = "", skip = 0, limit = 30) => {
    const items = await getItems({ query, skip, limit });

    this.setState({ items });
  }, 100);

  public async componentDidUpdate(prevProps: {}, prevState: IItemsState) {
    if (prevState.searchTerm !== this.state.searchTerm) {
      await this.getItems(this.state.searchTerm);
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
