import * as React from "react";

import { Link, RouteComponentProps } from "react-router-dom";
import { IItem, getItems } from "./data/api";
import { ItemIcon } from "./ItemTypeIcon";
import { debounce } from "lodash-es";
import { InfiniteLoader, AutoSizer, List } from "react-virtualized";
import { LoadState } from "src/util";
import {
  LoadingPlaceholder,
  LoadingPlaceholderSpinner
} from "src/LoadingPlaceholder";

interface IItemsState {
  items: IItem[];
  loadState: LoadState;
}

class Items extends React.Component<RouteComponentProps<{}>, IItemsState> {
  public state: IItemsState = {
    items: [],
    loadState: "loading"
  };

  private getSearchTerm(): string {
    const params = new URLSearchParams(this.props.location.search.substr(1));

    const searchTerm = params.get("search") || "";

    return searchTerm;
  }

  public async componentDidMount() {
    await this.getItems(this.getSearchTerm());
  }

  public getItems = debounce(async (query = "", skip = 0, limit = 30) => {
    this.setState({ loadState: "loading" });

    const items = await getItems({
      query,
      skip,
      limit
    });

    this.setState({ items, loadState: "success" });
  }, 100);

  public async componentDidUpdate(prevProps: RouteComponentProps<{}>) {
    if (prevProps.location.search !== this.props.location.search) {
      await this.getItems(this.getSearchTerm());
    }
  }

  public render() {
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
            value={this.getSearchTerm()}
            onChange={this.handleSearchTermChange}
            onFocus={e => e.currentTarget.select()}
          />
          {/* <span className="HeadingSearchFeedback">
            Found {displayedItems.length} items.
          </span> */}
        </header>
        {this.state.loadState === "loading" && this.state.items.length === 0 ? (
          <LoadingPlaceholderSpinner timeout={300} />
        ) : (
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
    this.state.items.length > options.index;

  private loadMoreRows = async (options: {
    startIndex: number;
    stopIndex: number;
  }) => {
    if (this.state.loadState === "loading") {
      return;
    }

    this.setState({ loadState: "loading" });

    const result = await getItems({
      query: this.getSearchTerm(),
      skip: options.startIndex,
      limit: options.stopIndex - options.startIndex + 1
    });

    this.setState(state => ({
      items: state.items.concat(result),
      loadState: "success"
    }));
  };

  private renderRow = (options: { index: number; key: any; style: any }) => {
    // if (!this.isRowLoaded(options)) {
    //   console.log("loading cell here");
    // }

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
