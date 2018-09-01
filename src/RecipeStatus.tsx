import React from "react";
import { IRecipe } from "src/data/api-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function RecipeStatus(props: { recipe: IRecipe }) {
  const { recipe } = props;

  const status = [];

  if (recipe.repeatable) {
    status.push(
      <FontAwesomeIcon key="repeatable" fixedWidth={true} icon="recycle" />
    );
  }

  if (recipe.done) {
    status.push(<FontAwesomeIcon key="done" fixedWidth={true} icon="check" />);
  }

  return <>{status}</>;
}
