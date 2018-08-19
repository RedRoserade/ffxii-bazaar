import * as React from "react";

import { Link, RouteComponentProps } from "react-router-dom";

import {
  IRecipe,
  minimumSetOfItemsForManyRecipes,
  getItem,
  IItem,
  getRelatedRecipes
} from "./data";

import { RecipeItems } from "./RecipeItems";
import { SubHeading } from "./SubHeading";
import { BackButton } from "./BackButton";
import { ItemTypeLabel } from "src/ItemTypeLabel";
import { GilLabel } from "src/GilLabel";

interface IParams {
  id: string;
}

interface IItemDetailsProps extends RouteComponentProps<IParams> {
  itemId: string;
}

interface IItemDetailsState {
  selectedRecipes: IRecipe[];
  item: IItem | null;
  usedInRecipes: IRecipe[];
  obtainedFromRecipes: IRecipe[];
}

class ItemDetails extends React.Component<
  IItemDetailsProps,
  IItemDetailsState
> {
  public state: IItemDetailsState = {
    selectedRecipes: [],
    item: null,
    usedInRecipes: [],
    obtainedFromRecipes: []
  };

  public async componentDidMount() {
    await this.getItem(this.props.match.params.id);
  }

  public async getItem(id: string) {
    const item = await getItem(id);

    if (item == null) {
      this.setState({ item: null });
      return;
    }

    const { usedIn, obtainedFrom } = await getRelatedRecipes(item);

    this.setState({
      item,
      usedInRecipes: usedIn,
      obtainedFromRecipes: obtainedFrom
    });
  }

  public async componentDidUpdate(
    prevProps: IItemDetailsProps,
    prevState: IItemDetailsState
  ) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.setState({ selectedRecipes: [] });
      await this.getItem(this.props.match.params.id);
    }
  }

  public render() {
    const { item, usedInRecipes, obtainedFromRecipes } = this.state;

    if (item == null) {
      return null;
    }

    return (
      <div className="Page">
        <header className="PageHeader">
          <h2>
            <ItemTypeLabel item={item} />
          </h2>
          <div className="HeaderAndBackButton">
            <BackButton />
            <h1>{item.name}</h1>
          </div>
        </header>

        <div className="PageContents">
          <SubHeading>Used in:</SubHeading>

          {usedInRecipes.length === 0 ? (
            "None"
          ) : (
            <>
              <div className="CustomList FullWidth">
                {usedInRecipes.map(r => (
                  <Link
                    key={r._id}
                    className="CustomListItem Multiline"
                    to={`/recipes/${r._id}`}
                  >
                    <div className="CustomListItemRow">
                      {r.name} (
                      {r.items.find(i => i.item._id === item._id)!.quantity} x)
                      for <GilLabel gil={r.cost} />
                      {(r.repeatable || r.done) && (
                        <span className="CustomListItemBadge">
                          {r.repeatable && "♻️"}
                          {r.done && "✔️"}
                        </span>
                      )}
                    </div>
                    <div className="CustomListItemRow">
                      <div className="CustomListItemActions">
                        <RecipeSelectToggle
                          selected={
                            this.state.selectedRecipes.indexOf(r) !== -1
                          }
                          onClick={e => this.handleRecipeSelected(e, r)}
                        />
                      </div>
                    </div>
                  </Link>
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

          {obtainedFromRecipes.length === 0 ? (
            "None"
          ) : (
            <div className="CustomList FullWidth">
              {obtainedFromRecipes.map(r => (
                <Link
                  to={`/recipes/${r._id}`}
                  key={r._id}
                  className="CustomListItem"
                >
                  {r.name} (
                  {r.result.find(i => i.item._id === item._id)!.quantity} x) for{" "}
                  <GilLabel gil={r.cost} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  private handleRecipeSelected(e: React.SyntheticEvent, r: IRecipe) {
    e.preventDefault();
    e.stopPropagation();

    const isSelected = this.state.selectedRecipes.some(x => r === x);

    if (!isSelected) {
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

function RecipeSelectToggle(props: {
  selected: boolean;
  onClick(e: React.SyntheticEvent<HTMLButtonElement>): void;
}) {
  return (
    <button
      type="button"
      className={`Button ButtonSmall ${props.selected ? "Active" : ""}`}
      onClick={e => props.onClick(e)}
    >
      {props.selected ? "Remove" : "Add"}
    </button>
  );
}
