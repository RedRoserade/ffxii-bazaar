import recipeData from "./data/recipes.js";
import itemData from "./data/items.js";

export function minimumSetOfItemsForManyRecipes(
  recipeList: IRecipe[]
): IRecipeItem[] {
  const itemQuantities = new Map<string, number>();

  for (const recipe of recipeList) {
    for (const item of recipe.items) {
      const itemId = item.item.id;

      if (!itemQuantities.has(itemId)) {
        itemQuantities.set(itemId, item.quantity);
      } else if (item.quantity > itemQuantities.get(itemId)!) {
        itemQuantities.set(itemId, item.quantity);
      }
    }
  }

  return Array.from(itemQuantities.entries()).map(([itemId, qty]) => ({
    item: itemMap[itemId],
    quantity: qty
  }));
}

export enum ItemType {
  Weapon = "weapon",
  Armour = "armour",
  HealingItem = "healingItem",
  Loot = "loot",
  KeyItem = "keyItem"
}

export interface IItem {
  name: string;
  id: string;
  type: ItemType;
}

export interface IRecipeItem {
  item: IItem;
  quantity: number;
}

export interface IRecipe {
  id: string;
  name: string;
  items: IRecipeItem[];
  cost: number;
  result: IRecipeItem[];
  repeatable: boolean;
}

const recipes: IRecipe[] = recipeData as any;
const items: IItem[] = itemData as any;

export { recipes, items };

export const itemMap: { [id: string]: IItem } = itemData.reduce(
  (map, item) => ({ ...map, [item.id]: item }),
  {}
);

export const recipeMap: { [id: string]: IRecipe } = recipeData.reduce(
  (map, item) => ({ ...map, [item.id]: item }),
  {}
);
