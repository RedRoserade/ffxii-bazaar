import * as React from "react";
import { RouteComponentProps } from "react-router";

import { apiWorker } from "./data/api-worker";
import { IRecipe } from "./data/api-types";

import { SubHeading } from "./SubHeading";
import { RecipeItems } from "./RecipeItems";
import { GilLabel } from "./GilLabel";
import { BackButton } from "./BackButton";
import { LoadState } from "./util";
import { LoadingPlaceholder, LoadingSpinner } from "./LoadingPlaceholder";

interface IParams {
  id: string;
}

interface IRecipeDetailsProps extends RouteComponentProps<IParams> {
  recipeId: string;
}

interface IRecipeDetailsState {
  recipe: IRecipe | null;
  loadState: LoadState;
}

class RecipeDetails extends React.Component<
  IRecipeDetailsProps,
  IRecipeDetailsState
  > {
  public state: IRecipeDetailsState = {
    recipe: null,
    loadState: "loading"
  };

  public async componentDidMount() {
    await this.getRecipe(this.props.match.params.id);
  }

  public async getRecipe(id: string) {
    this.setState({ loadState: "loading" });

    const recipe = await apiWorker.getRecipe(id);

    this.setState({ recipe, loadState: recipe != null ? "success" : "error" });
  }

  public async componentDidUpdate(prevProps: IRecipeDetailsProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      await this.getRecipe(this.props.match.params.id);
    }
  }

  public toggleRecipeDone = async () => {
    if (this.state.recipe == null) {
      return;
    }

    this.setState(state => {
      if (state.recipe == null) {
        return null;
      }

      return {
        recipe: { ...state.recipe, done: !state.recipe.done }
      };
    });

    await apiWorker.toggleRecipeDone(this.state.recipe);
  };

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
                      <h1>Loading recipe...</h1>
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

    const { recipe } = this.state;

    if (recipe == null) {
      return null;
    }

    return (
      <div className="Page">
        <header className="PageHeader">
          <div className="PageHeaderRow">
            <div className="HeaderAndBackButton">
              <BackButton />
              <h1>{recipe.name}</h1>
            </div>
          </div>
        </header>

        <div className="PageContents HasFloatingFooter">
          <SubHeading>Cost:</SubHeading>
          <p>
            <GilLabel gil={recipe.cost} />
          </p>

          <SubHeading>Items:</SubHeading>
          <div className="FullWidth">
            <RecipeItems items={recipe.items} />
          </div>

          <SubHeading>Result:</SubHeading>
          <div className="FullWidth">
            <RecipeItems items={recipe.result} />
          </div>
        </div>

        <div className="FloatingPageFooter">
          <button
            type="button"
            className={`Button ${recipe.done ? "Active" : ""}`}
            onClick={this.toggleRecipeDone}
          >
            {recipe.done ? "Not Done" : "Done"}
          </button>
        </div>
      </div>
    );
  }
}

export { RecipeDetails };
