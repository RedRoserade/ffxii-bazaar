import * as React from "react";

import { Link } from "react-router-dom";
import { IItem, getItems } from "./data";
import { ItemIcon } from "./ItemTypeIcon";

interface IItemsState {
  searchTerm: string;
  items: IItem[];
}

class Items extends React.Component {
  public state: IItemsState = {
    searchTerm: "",
    items: []
  };

  public async componentDidMount() {
    await this.getItems("");
  }

  public async getItems(query = "") {
    const items = await getItems({ query });

    this.setState({ items });
  }

  public async componentDidUpdate(prevProps: {}, prevState: IItemsState) {
    if (prevState.searchTerm !== this.state.searchTerm) {
      await this.getItems(this.state.searchTerm);
    }
  }

  public render() {
    const displayedItems = this.state.items;

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
          <span className="HeadingSearchFeedback">
            Found {displayedItems.length} items.
          </span>
        </header>
        <div className="PageContents">
          {displayedItems.length > 0 ? (
            <div className="CustomList FullWidth">
              {displayedItems.map(i => (
                <Link
                  to={`/items/${i._id}`}
                  key={i._id}
                  className="CustomListItem"
                >
                  <ItemIcon item={i} />
                  &nbsp;
                  {i.name}
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

export { Items };
