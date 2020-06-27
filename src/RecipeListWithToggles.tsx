import * as React from "react";

import { Link } from "react-router-dom";

import { GilLabel } from "./GilLabel";
import { RecipeStatus } from "./RecipeStatus";
import { IRecipe, IItem } from "./data/api-types";
import { SelectedRecipesContext } from "./SelectedRecipes";

export function RecipeSelectToggle(props: { recipe: IRecipe }) {
  const [selectedRecipes, setSelectedRecipes] = React.useContext(SelectedRecipesContext);
  function toggleRecipe(e: React.SyntheticEvent) {
    // This is used inside links, we need to prevent the event propagation, otherwise
    // the link is clicked too.
    e.preventDefault();
    e.stopPropagation();

    let copy = [...selectedRecipes];
    let index = copy.findIndex((selected) => selected._id === props.recipe._id);

    if (index !== -1) {
      copy.splice(index, 1);
    } else {
      copy.push(props.recipe);
    }

    setSelectedRecipes(copy);
  }

  let selected = selectedRecipes.some((r) => r._id === props.recipe._id);

  return (
    <button type="button" className={`Button ${selected ? "Active" : ""}`} onClick={toggleRecipe}>
      {selected ? "Remove" : "Add"}
    </button>
  );
}

function ItemQuantityLabel(props: { item?: IItem; recipe: IRecipe }) {
  const { item, recipe } = props;

  let recipeItem = recipe.items.find((i) => i.item._id === item?._id);

  if (recipeItem == null) {
    return <React.Fragment />;
  }

  return <>({recipeItem.quantity} x)</>;
}

export function RecipeListWithToggles(props: { recipes: IRecipe[]; item?: IItem }) {
  const { recipes, item } = props;

  return (
    <div className="CustomList FullWidth">
      {recipes.map((r) => (
        <Link key={r._id} className="CustomListItem Multiline" to={`/recipes/${r._id}`}>
          <div className="CustomListItemRow">
            {r.name} <ItemQuantityLabel item={item} recipe={r} /> for <GilLabel gil={r.cost} />
            {(r.repeatable || r.done) && (
              <span className="CustomListItemBadge">
                <RecipeStatus recipe={r} />
              </span>
            )}
          </div>
          <div className="CustomListItemRow">
            <div className="CustomListItemActions">
              <RecipeSelectToggle recipe={r} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
