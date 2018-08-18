import * as React from "react";

import { Link } from "react-router-dom";
import { items } from "./data";
import { ItemIcon } from "src/ItemIcon";

interface IItemsState {
  searchTerm: string;
}

class Items extends React.Component {
  public state: IItemsState = {
    searchTerm: ""
  };

  public render() {
    const displayedItems =
      this.state.searchTerm.length === 0
        ? items
        : items.filter(i =>
            i.name.toLowerCase().includes(this.state.searchTerm.toLowerCase())
          );

    return (
      <div className="Page">
        <header className="PageHeader">
          <input
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

        {displayedItems.length > 0 ? (
          <div className="CustomList FullWidth">
            {displayedItems.map(i => (
              <Link to={`/items/${i.id}`} key={i.id} className="CustomListItem">
                <ItemIcon item={i} />&nbsp;{i.name}
              </Link>
            ))}
          </div>
        ) : (
          <div className="NoResultsFeedback">Nothing.</div>
        )}
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
