import worker from "workerize-loader!src/data/api";
import {
  IRecipe,
  IGetRecipesOptions,
  IItem,
  IGetItemsOptions,
  IRelatedRecipes,
  IRecipeItem
} from "src/data/api-types";

interface IApiWorker {
  getRecipes(options: IGetRecipesOptions): Promise<IRecipe[]>;
  getRecipe(id: string): Promise<IRecipe | null>;
  getItems(options: IGetItemsOptions): Promise<IItem[]>;
  getItem(id: string): Promise<IItem | null>;
  getRelatedRecipes(item: IItem): Promise<IRelatedRecipes>;
  toggleRecipeDone(recipe: IRecipe): Promise<IRecipe>;
  minimumSetOfItemsForManyRecipes(
    recipeList: IRecipe[]
  ): Promise<IRecipeItem[]>;
}

const apiWorker = worker<IApiWorker>();

export { apiWorker };
