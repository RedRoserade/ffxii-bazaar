import * as React from "react";
import { RouteComponentProps } from "react-router";

import { IRecipe, getRecipe } from "./data";

import { SubHeading } from "./SubHeading";
import { RecipeItems } from "./RecipeItems";
import { GilLabel } from "./GilLabel";
import { BackButton } from "./BackButton";

interface IParams {
  id: string;
}

interface IRecipeDetailsProps extends RouteComponentProps<IParams> {
  recipeId: string;
}

interface IRecipeDetailsState {
  recipe: IRecipe | null;
}

class RecipeDetails extends React.Component<
  IRecipeDetailsProps,
  IRecipeDetailsState
> {
  public state: IRecipeDetailsState = {
    recipe: null
  };

  public async componentDidMount() {
    await this.getRecipe(this.props.match.params.id);
  }

  public async getRecipe(id: string) {
    const recipe = await getRecipe(id);

    this.setState({ recipe });
  }

  public async componentDidUpdate(prevProps: IRecipeDetailsProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      await this.getRecipe(this.props.match.params.id);
    }
  }

  public render() {
    const { recipe } = this.state;

    if (recipe == null) {
      return null;
    }

    return (
      <div className="Page">
        <header className="PageHeader">
          <h2>{recipe.repeatable && "Repeatable"} Recipe</h2>
          <div className="HeaderAndBackButton">
            <BackButton />
            <h1>{recipe.name}</h1>
          </div>
        </header>

        <div>
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
      </div>
    );
  }
}

export { RecipeDetails };
