import * as React from "react";

import { Link, RouteComponentProps } from "react-router-dom";

import {
  IRecipe,
  itemMap,
  minimumSetOfItemsForManyRecipes,
  recipes
} from "src/data";

import { RecipeItems } from "src/RecipeItems";
import { GilLabel } from "src/Recipes";
import { SubHeading } from "src/SubHeading";

interface IParams {
  id: string;
}

interface IItemDetailsProps extends RouteComponentProps<IParams> {
  itemId: string;
}

interface IItemDetailsState {
  selectedRecipes: IRecipe[];
}

class ItemDetails extends React.Component<
  IItemDetailsProps,
  IItemDetailsState
> {
  public state: IItemDetailsState = {
    selectedRecipes: []
  };

  public componentDidUpdate(
    prevProps: IItemDetailsProps,
    prevState: IItemDetailsState
  ) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.setState({ selectedRecipes: [] });
    }
  }

  public render() {
    const item = itemMap[this.props.match.params.id];

    const usedInRecipes = recipes.filter(r =>
      r.items.some(i => i.item.id === item.id)
    );

    const obtainedInRecipes = recipes.filter(r =>
      r.result.some(i => i.item.id === item.id)
    );

    return (
      <div className="Page">
        <header className="PageHeader">
          <h2>{item.type}</h2>
          <h1>{item.name}</h1>
        </header>

        <div>
          <SubHeading>Used in:</SubHeading>

          {usedInRecipes.length === 0 ? (
            "None"
          ) : (
            <>
              <div className="CustomList FullWidth">
                {usedInRecipes.map(r => (
                  <div
                    key={r.id}
                    className="CustomListItem CustomListItemWithInput"
                  >
                    <Link to={`/recipes/${r.id}`}>
                      {r.name} ({
                        r.items.find(i => i.item.id === item.id)!.quantity
                      }{" "}
                      x) for <GilLabel gil={r.cost} />
                    </Link>
                    <label>
                      <input
                        type="checkbox"
                        checked={this.state.selectedRecipes.indexOf(r) !== -1}
                        onChange={e => this.handleRecipeSelected(e, r)}
                      />
                    </label>
                  </div>
                ))}
              </div>
              <SubHeading>Required items for the selected recipes:</SubHeading>

              {this.state.selectedRecipes.length > 0 ? (
                <div className="FullWidth">
                  <RecipeItems
                    items={minimumSetOfItemsForManyRecipes(
                      this.state.selectedRecipes
                    )}
                  />
                </div>
              ) : (
                <p>
                  Select one or more recipes above to see all the items needed.
                </p>
              )}
            </>
          )}

          <SubHeading>Obtained from:</SubHeading>

          {obtainedInRecipes.length === 0 ? (
            "None"
          ) : (
            <div className="CustomList FullWidth">
              {obtainedInRecipes.map(r => (
                <Link
                  to={`/recipes/${r.id}`}
                  key={r.id}
                  className="CustomListItem"
                >
                  {r.name} ({
                    r.result.find(i => i.item.id === item.id)!.quantity
                  }{" "}
                  x) for <GilLabel gil={r.cost} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  private handleRecipeSelected(
    e: React.SyntheticEvent<HTMLInputElement>,
    r: IRecipe
  ) {
    if (e.currentTarget.checked) {
      this.setState(state => {
        return {
          selectedRecipes: [...state.selectedRecipes, r]
        };
      });
    } else {
      this.setState(state => {
        return {
          selectedRecipes: state.selectedRecipes.filter(i => i !== r)
        };
      });
    }
  }
}

export { ItemDetails };
