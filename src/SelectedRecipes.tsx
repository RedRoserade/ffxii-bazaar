import React from "react";
import { IRecipe } from "./data/api-types";

/**
 * Context which will hold the recipes the user selected to craft.
 */
export const SelectedRecipesContext = React.createContext<[IRecipe[], (value: IRecipe[]) => any]>([[], (_) => {}]);

export function SelectedRecipesHolder(props: React.PropsWithChildren<{}>) {
  let [selectedRecipes, setSelectedRecipes] = React.useState<IRecipe[]>([]);

  return (
    <SelectedRecipesContext.Provider value={[selectedRecipes, setSelectedRecipes]}>
      <>{props.children}</>
    </SelectedRecipesContext.Provider>
  );
}

export function SelectedRecipesLabel() {
  let [selectedRecipes] = React.useContext(SelectedRecipesContext);

  return <>List ({selectedRecipes.length})</>;
}
