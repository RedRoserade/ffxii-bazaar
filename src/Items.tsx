import * as React from "react";

import { Link, RouteComponentProps } from "react-router-dom";
import { apiWorker } from "./data/api-worker";
import { IItem, UsageStatus } from "./data/api-types";
import { ItemIcon } from "./ItemTypeIcon";
import { debounce } from "lodash-es";
import { InfiniteLoader, AutoSizer, List } from "react-virtualized";
import { LoadState } from "./util";
import { LoadingPlaceholderSpinner, LoadingPlaceholderOverlaySpinner } from "./LoadingPlaceholder";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IItemsState {
  items: IItem[];
  loadState: LoadState;
  showOptions: boolean;
}

interface ISearchOptions {
  query: string;
  usageStatus: UsageStatus;
}

class Items extends React.Component<RouteComponentProps<{}>, IItemsState> {
  public state: IItemsState = {
    items: [],
    loadState: "loading",
    showOptions: false,
  };

  private getSearchOptions(): { query: string; usageStatus: UsageStatus } {
    const params = new URLSearchParams(this.props.location.search.substr(1));

    const query = params.get("query") || "";
    const usageStatus = (params.get("usageStatus") as UsageStatus) || "all";

    return { query, usageStatus };
  }

  public async componentDidMount() {
    await this.getItems(this.getSearchOptions());
  }

  public getItems = debounce(async (searchOptions: Partial<ISearchOptions> = {}, skip = 0, limit = 30) => {
    this.setState({ loadState: "loading" });

    const items = await apiWorker.getItems({
      ...searchOptions,
      skip,
      limit,
    });

    this.setState({ items, loadState: "success" });
  }, 100);

  public async componentDidUpdate(prevProps: RouteComponentProps<{}>) {
    if (prevProps.location.search !== this.props.location.search) {
      await this.getItems(this.getSearchOptions());
    }
  }

  public toggleShowOptions = () => this.setState((state) => ({ showOptions: !state.showOptions }));

  public makeQuery(options: ISearchOptions): URLSearchParams {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(options)) {
      if (!key || !value) {
        continue;
      }

      params.set(key, value);
    }

    return params;
  }

  public setUsageStatus = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const usageStatus = e.currentTarget.value as UsageStatus;

    console.log("Setting usageStatus to", usageStatus);

    const search = this.makeQuery({
      ...this.getSearchOptions(),
      usageStatus: usageStatus,
    });

    this.props.history.replace(`${this.props.match.path}?${search}`);
  };

  public render() {
    const { query, usageStatus } = this.getSearchOptions();

    return (
      <div className="Page">
        <header className="PageHeader">
          <div className="PageHeaderRow">
            <label className="HiddenLabel" htmlFor="ffxii-ItemsSearchInput">
              Search for items
            </label>
            <input
              id="ffxii-ItemsSearchInput"
              className="HeadingSearchInput"
              placeholder="eg: 'Wolf Pelt'"
              type="text"
              value={query}
              onChange={this.handleSearchTermChange}
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>
          {/* <span className="HeadingSearchFeedback">
            Found {displayedItems.length} items.
          </span> */}
          <div className="PageHeaderRow ReverseRow">
            <button
              type="button"
              className="PageHeaderButton"
              onClick={this.toggleShowOptions}
              aria-label="Open or close search options"
            >
              <FontAwesomeIcon icon="sliders-h" size="lg" />
            </button>
          </div>
          {this.state.showOptions && (
            <div className="PageHeaderRow Secondary">
              <PageHeaderOptions>
                <PageHeaderOption
                  name="usageStatus"
                  onChange={this.setUsageStatus}
                  isSelected={usageStatus === "all"}
                  optionValue="all"
                  label="Show all items"
                />
                <PageHeaderOption
                  name="usageStatus"
                  onChange={this.setUsageStatus}
                  isSelected={usageStatus === "withPendingRecipes"}
                  optionValue="withPendingRecipes"
                  label="Only show items that are still useful for pending recipes"
                />
                <PageHeaderOption
                  name="usageStatus"
                  onChange={this.setUsageStatus}
                  isSelected={usageStatus === "withoutPendingRecipes"}
                  optionValue="withoutPendingRecipes"
                  label="Only show items that no longer have an use in any recipe"
                />
              </PageHeaderOptions>
            </div>
          )}
        </header>
        {this.state.loadState === "loading" && this.state.items.length === 0 ? (
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
                      rowCount={this.state.items.length}
                      rowHeight={43}
                      rowRenderer={this.renderRow}
                      width={width}
                      // Prop that forces a re-render via shallow compare when the data source changes.
                      _={this.state.items}
                    />
                  )}
                </AutoSizer>
              )}
            </InfiniteLoader>

            {this.state.loadState === "loading" && <LoadingPlaceholderOverlaySpinner timeout={2000} />}
          </div>
        )}
      </div>
    );
  }

  private handleSearchTermChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const query = e.currentTarget.value;

    const search = this.makeQuery({
      ...this.getSearchOptions(),
      query,
    });

    this.props.history.replace(`${this.props.match.path}?${search}`);
  };

  private isRowLoaded = (options: { index: number }) => this.state.items.length > options.index;

  private loadMoreRows = async (options: { startIndex: number; stopIndex: number }) => {
    if (this.state.loadState === "loading") {
      return;
    }

    this.setState({ loadState: "loading" });

    const result = await apiWorker.getItems({
      ...this.getSearchOptions(),
      skip: options.startIndex,
      limit: options.stopIndex - options.startIndex + 1,
    });

    this.setState((state) => ({
      items: state.items.concat(result),
      loadState: "success",
    }));
  };

  private renderRow = (options: { index: number; key: any; style: any }) => {
    // if (!this.isRowLoaded(options)) {
    //   console.log("loading cell here");
    // }

    const i = this.state.items[options.index];

    return (
      <Link to={`/items/${i._id}`} key={options.key} className="CustomListItem" style={options.style}>
        <ItemIcon item={i} />
        &nbsp;
        {i.name}
      </Link>
    );
  };
}

export { Items };

function PageHeaderOption(props: {
  label: React.ReactNode;
  onChange(e: React.SyntheticEvent<HTMLInputElement>): void;
  optionValue: string;
  isSelected: boolean;
  name: string;
}) {
  const id = `${props.name}_${props.optionValue}`;
  return (
    <div className="PageHeaderOption">
      <input
        type="radio"
        name={props.name}
        value={props.optionValue}
        onChange={props.onChange}
        checked={props.isSelected}
        id={id}
      />
      <label htmlFor={id}>{props.label}</label>
    </div>
  );
}

function PageHeaderOptions(props: { children: React.ReactNode }) {
  return <div className="PageHeaderOptions">{props.children}</div>;
}
