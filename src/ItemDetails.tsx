import * as React from "react";

import { Link, RouteComponentProps } from "react-router-dom";

import { apiWorker } from "./data/api-worker";

import { SubHeading } from "./SubHeading";
import { BackButton } from "./BackButton";
import { GilLabel } from "./GilLabel";
import { LoadState } from "./typings";
import { LoadingPlaceholder, LoadingSpinner } from "./LoadingPlaceholder";
import { IRecipe, IItem, INameWithLink } from "./data/api-types";
import { SelectedRecipesContext } from "./SelectedRecipes";
import { RecipeListWithToggles } from "./RecipeListWithToggles";

interface IParams {
  id: string;
}

interface IItemDetailsProps extends RouteComponentProps<IParams> {
  itemId: string;
}

interface IItemDetailsState {
  item: IItem | null;
  usedInRecipes: IRecipe[];
  obtainedFromRecipes: IRecipe[];
  loadState: LoadState;
}

class ItemDetails extends React.Component<IItemDetailsProps, IItemDetailsState> {
  static contextType = SelectedRecipesContext;
  context!: React.ContextType<typeof SelectedRecipesContext>;

  public state: IItemDetailsState = {
    item: null,
    usedInRecipes: [],
    obtainedFromRecipes: [],
    loadState: "loading",
  };

  public async componentDidMount() {
    await this.getItem(this.props.match.params.id);
  }

  public async getItem(id: string) {
    this.setState({ loadState: "loading" });
    const item = await apiWorker.getItem(id);

    if (item == null) {
      this.setState({ item: null, loadState: "error" });
      return;
    }

    const { usedIn, obtainedFrom } = await apiWorker.getRelatedRecipes(item);

    this.setState({
      item,
      usedInRecipes: usedIn,
      obtainedFromRecipes: obtainedFrom,
      loadState: "success",
    });
  }

  public async componentDidUpdate(prevProps: IItemDetailsProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
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

    const { item, usedInRecipes, obtainedFromRecipes } = this.state;

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
          {item.quest_item === true && (
            <p className="Warning FullWidth">
              Careful, this item may be necessary to complete one or more quests. Avoid selling this item unless you are
              sure you no longer need it.
            </p>
          )}

          <SubHeading>Used in:</SubHeading>

          {usedInRecipes.length === 0 ? (
            "None"
          ) : (
            <>
              <RecipeListWithToggles item={item} recipes={usedInRecipes} />
            </>
          )}

          <SubHeading>Obtained from:</SubHeading>

          {obtainedFromRecipes.length === 0 ? (
            "None"
          ) : (
            <div className="CustomList FullWidth">
              {obtainedFromRecipes.map((r) => (
                <Link to={`/recipes/${r._id}`} key={r._id} className="CustomListItem">
                  {r.name} ({r.result.find((i) => i.item._id === item._id)!.quantity} x) for <GilLabel gil={r.cost} />
                </Link>
              ))}
            </div>
          )}

          <MonsterList title="Dropped from:" monsters={item.drop} />
          <MonsterList title="Monograph drop:" monsters={item.monograph} />
          <MonsterList title="Stolen from:" monsters={item.steal} />
          <MonsterList title="Poached from:" monsters={item.poach} />
        </div>
      </div>
    );
  }
}

export { ItemDetails };

function MonsterList(props: { title: React.ReactNode; monsters: INameWithLink[] | null }) {
  if (props.monsters == null) {
    return null;
  }

  if (!props.monsters.length) {
    return (
      <>
        <SubHeading>{props.title}</SubHeading>
        None
      </>
    );
  }

  return (
    <>
      <SubHeading>{props.title}</SubHeading>

      <div className="CustomList FullWidth">
        {props.monsters.map((m) => (
          <MonsterListItem key={m.name} monster={m} />
        ))}
      </div>
    </>
  );
}

function MonsterListItem(props: { monster: INameWithLink }) {
  return (
    <a className="CustomListItem" href={props.monster.link} target="_blank" rel="noopener noreferrer">
      {props.monster.name}
    </a>
  );
}
