import { recipesDb } from "src/data/recipes-db";
import { itemsDb } from "src/data/items-db";

export function minimumSetOfItemsForManyRecipes(
  recipeList: IRecipe[]
): IRecipeItem[] {
  const itemQuantities = new Map<string, [IItem, number]>();

  for (const recipe of recipeList) {
    for (const item of recipe.items) {
      const itemId = item.item._id;

      if (!itemQuantities.has(itemId)) {
        itemQuantities.set(itemId, [item.item, item.quantity]);
      } else if (item.quantity > itemQuantities.get(itemId)![1]) {
        itemQuantities.set(itemId, [item.item, item.quantity]);
      }
    }
  }

  return Array.from(itemQuantities.values()).map(([item, qty]) => ({
    item,
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
  _id: string;
  type: ItemType;
}

export interface IRecipeItem {
  item: IItem;
  quantity: number;
}

export interface IRecipe {
  _id: string;
  name: string;
  items: IRecipeItem[];
  cost: number;
  result: IRecipeItem[];
  repeatable: boolean;
  done: boolean;
}

export async function getRecipes(options: { query?: string } = {}) {
  const request: PouchDB.Find.FindRequest<IRecipe> = { selector: {} };

  if (options.query) {
    request.selector.name = { $regex: new RegExp(options.query, "i") };
  }

  const all = await recipesDb.find(request);

  return all.docs;
}

export async function getRecipe(id: string): Promise<IRecipe | null> {
  try {
    const recipe = await recipesDb.get(id);

    return recipe;
  } catch (e) {
    if (e.name === "not_found") {
      return null;
    }

    throw e;
  }
}

export async function getItems(options: { query?: string } = {}) {
  const request: PouchDB.Find.FindRequest<IItem> = { selector: {} };

  if (options.query) {
    request.selector.name = { $regex: new RegExp(options.query, "i") };
  }

  const all = await itemsDb.find(request);

  return all.docs;
}

export async function getItem(id: string): Promise<IItem | null> {
  try {
    const item = await itemsDb.get(id);

    return item;
  } catch (e) {
    if (e.name === "not_found") {
      return null;
    }

    throw e;
  }
}

export async function getRelatedRecipes(
  item: IItem
): Promise<{ usedIn: IRecipe[]; obtainedFrom: IRecipe[] }> {
  const usedInRecipesQuery = recipesDb.find({
    selector: { items: { $elemMatch: { "item._id": { $eq: item._id } } } }
  });

  const obtainedFromRecipesQuery = recipesDb.find({
    selector: { result: { $elemMatch: { "item._id": { $eq: item._id } } } }
  });

  const [usedInRecipes, obtainedFromRecipes] = await Promise.all([
    usedInRecipesQuery,
    obtainedFromRecipesQuery
  ]);

  return {
    usedIn: usedInRecipes.docs,
    obtainedFrom: obtainedFromRecipes.docs
  };
}

export async function toggleRecipeDone(recipe: IRecipe) {
  const existing = await getRecipe(recipe._id);

  if (existing == null) {
    throw new Error("Recipe not found.");
  }

  existing.done = !existing.done;

  await recipesDb.put(existing);

  return existing;
}
