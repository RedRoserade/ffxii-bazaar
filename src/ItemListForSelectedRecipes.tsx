import React from "react";
import { IRecipe, IRecipeItem } from "./data/api-types";
import { apiWorker } from "./data/api-worker";
import { SubHeading } from "./SubHeading";
import { RecipeItems } from "./RecipeItems";
import { Link } from "react-router-dom";
import { RecipeListWithToggles } from "./RecipeListWithToggles";
import { BackButton } from "./BackButton";
import { SelectedRecipesContext } from "./SelectedRecipes";

async function updateItemSetForSelectedRecipes(recipes: IRecipe[], cb: (items: IRecipeItem[]) => any) {
  const items = await apiWorker.minimumSetOfItemsForManyRecipes(recipes);
  cb(items);
}

export function ItemListForSelectedRecipes() {
  const [selectedRecipes, setSelectedRecipes] = React.useContext(SelectedRecipesContext);

  let [itemSetForSelectedRecipes, setItemSetForSelectedRecipes] = React.useState<IRecipeItem[]>([]);

  React.useEffect(() => {
    updateItemSetForSelectedRecipes(selectedRecipes, setItemSetForSelectedRecipes);
  }, [selectedRecipes]);

  async function markRecipesAsDone() {
    const recipesWhichAreNotDone = selectedRecipes.filter((x) => !x.done);

    await apiWorker.toggleRecipeDone(...recipesWhichAreNotDone);

    setSelectedRecipes([]);
  }

  return (
    <div className="Page">
      <header className="PageHeader">
        <div className="PageHeaderRow">
          <div className="HeaderAndBackButton">
            <BackButton />
            <h1>Selling list</h1>
          </div>
        </div>
      </header>

      {selectedRecipes.length > 0 ? (
        <RecipeAndItemList
          selectedRecipes={selectedRecipes}
          markRecipesAsDone={markRecipesAsDone}
          itemSetForSelectedRecipes={itemSetForSelectedRecipes}
        />
      ) : (
        <div className="PageContents">
          <SubHeading>No recipes selected</SubHeading>
          <p>
            You have no recipes selected. Go to the <Link to="/recipes">recipes</Link> page and select some.
          </p>
        </div>
      )}
    </div>
  );
}

function RecipeAndItemList(props: {
  selectedRecipes: IRecipe[];
  markRecipesAsDone: () => any;
  itemSetForSelectedRecipes: IRecipeItem[];
}) {
  const { selectedRecipes, markRecipesAsDone, itemSetForSelectedRecipes } = props;
  return (
    <div className="PageContents">
      <SubHeading>Selected recipes:</SubHeading>

      <RecipeListWithToggles recipes={selectedRecipes} />

      <div className="VerticalGroup" />
      <div className="Row VerticalGroup Reverse">
        <button type="button" className={`Button`} onClick={markRecipesAsDone}>
          Mark {selectedRecipes.length} as 'Done'
        </button>
      </div>

      <SubHeading>Required items for the selected recipes:</SubHeading>

      <div className="FullWidth">
        <RecipeItems items={itemSetForSelectedRecipes} />
      </div>
    </div>
  );
}
