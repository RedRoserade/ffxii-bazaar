import * as React from "react";

import { Link, RouteComponentProps } from "react-router-dom";

import {
  minimumSetOfItemsForManyRecipes,
  getItem,
  getRelatedRecipes
} from "src/data/api";

import { RecipeItems } from "src/RecipeItems";
import { SubHeading } from "src/SubHeading";
import { BackButton } from "src/BackButton";
import { GilLabel } from "src/GilLabel";
import { RecipeStatus } from "src/RecipeStatus";
import { LoadState } from "src/util";
import { LoadingPlaceholder, LoadingSpinner } from "src/LoadingPlaceholder";
import { IRecipe, IItem, IRecipeItem } from "src/data/api-types";

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
  loadState: LoadState;
  itemSetForSelectedRecipes: IRecipeItem[];
}

class ItemDetails extends React.Component<
  IItemDetailsProps,
  IItemDetailsState
> {
  public state: IItemDetailsState = {
    selectedRecipes: [],
    item: null,
    usedInRecipes: [],
    obtainedFromRecipes: [],
    loadState: "loading",
    itemSetForSelectedRecipes: []
  };

  public async componentDidMount() {
    await this.getItem(this.props.match.params.id);
  }

  public async getItem(id: string) {
    this.setState({ loadState: "loading" });
    const item = await getItem(id);

    if (item == null) {
      this.setState({ item: null, loadState: "error" });
      return;
    }

    const { usedIn, obtainedFrom } = await getRelatedRecipes(item);

    this.setState({
      item,
      usedInRecipes: usedIn,
      obtainedFromRecipes: obtainedFrom,
      loadState: "success"
    });
  }

  public async componentDidUpdate(prevProps: IItemDetailsProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.setState({ selectedRecipes: [], itemSetForSelectedRecipes: [] });
      await this.getItem(this.props.match.params.id);
    }
  }

  public render() {
    if (this.state.loadState === "loading") {
      return (
        <div className="Page">
          <LoadingPlaceholder timeout={300}>
            {({ show }) => (
              <>
                <header className="PageHeader">
                  <div className="PageHeaderRow">
                    <div className="HeaderAndBackButton">
                      <BackButton />
                      <h1>Loading item...</h1>
                    </div>
                  </div>
                </header>
                {show && <LoadingSpinner />}
              </>
            )}
          </LoadingPlaceholder>
        </div>
      );
    }

    const {
      item,
      usedInRecipes,
      obtainedFromRecipes,
      itemSetForSelectedRecipes
    } = this.state;

    if (item == null) {
      return null;
    }

    return (
      <div className="Page">
        <header className="PageHeader">
          <div className="PageHeaderRow">
            <div className="HeaderAndBackButton">
              <BackButton />
              <h1>{item.name}</h1>
            </div>
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
                          <RecipeStatus recipe={r} />
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
                  <RecipeItems items={itemSetForSelectedRecipes} />
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

    let selectedRecipes: IRecipe[] = [];

    if (!isSelected) {
      selectedRecipes = [...this.state.selectedRecipes, r];
    } else {
      selectedRecipes = this.state.selectedRecipes.filter(i => i !== r);
    }

    this.setState({
      selectedRecipes
    });

    this.updateItemSetForSelectedRecipes(selectedRecipes);
  }

  private async updateItemSetForSelectedRecipes(recipes: IRecipe[]) {
    const items = await minimumSetOfItemsForManyRecipes(recipes);

    this.setState({ itemSetForSelectedRecipes: items });
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
