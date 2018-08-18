import * as React from "react";
import { RouteComponentProps } from "react-router";

import { recipeMap } from "./data";

import { SubHeading } from "src/SubHeading";
import { RecipeItems } from "./RecipeItems";
import { GilLabel } from "./Recipes";
import { BackButton } from "./BackButton";

interface IParams {
  id: string;
}

interface IRecipeDetailsProps extends RouteComponentProps<IParams> {
  recipeId: string;
}

class RecipeDetails extends React.Component<IRecipeDetailsProps> {
  public render() {
    const recipe = recipeMap[this.props.match.params.id];

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
