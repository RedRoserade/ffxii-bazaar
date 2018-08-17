import * as React from "react";

import { Link } from "react-router-dom";

import { recipes } from "./data";

const nf = new Intl.NumberFormat([...navigator.languages], {
  maximumFractionDigits: 0,
  useGrouping: false
});

export function GilLabel({ gil }: { gil: number }) {
  return <>{nf.format(gil)} gil</>;
}

interface IRecipeState {
  searchTerm: string;
}

class Recipes extends React.Component<{}, IRecipeState> {
  public state: IRecipeState = {
    searchTerm: ""
  };

  public render() {
    const displayedRecipes =
      this.state.searchTerm.length === 0
        ? recipes
        : recipes.filter(r =>
            r.name.toLowerCase().includes(this.state.searchTerm.toLowerCase())
          );

    return (
      <div className="Page">
        <header className="PageHeader">
          <input
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

        {displayedRecipes.length > 0 ? (
          <div className="CustomList FullWidth">
            {displayedRecipes.map(r => (
              <Link
                to={`/recipes/${r.id}`}
                key={r.id}
                className="CustomListItem"
              >
                {r.name}
                {r.repeatable && (
                  <span className="CustomListItemBadge">♻️</span>
                )}
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

export { Recipes };
