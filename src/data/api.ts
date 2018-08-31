import { recipesDb } from "src/data/recipes-db";
import { itemsDb } from "src/data/items-db";
import { waitForRecipeData, waitForItemData } from "src/data/sync";

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

interface IPaginationOptions {
  skip?: number;
  limit?: number;
}

interface IGetRecipesOptions extends IPaginationOptions {
  query?: string;
  done?: boolean;
  repeatable?: boolean;
}

export async function getRecipes(options: IGetRecipesOptions = {}) {
  await waitForRecipeData();

  const request: PouchDB.Find.FindRequest<IRecipe> = {
    selector: {},
    skip: options.skip,
    limit: options.limit
  };

  const args: PouchDB.Find.Selector[] = [];

  if (options.query) {
    args.push({ name: { $regex: new RegExp(options.query, "i") } });
  }

  if (options.done === true) {
    args.push({ done: true });
  } else if (options.done === false) {
    args.push({
      $or: [
        { done: { $exists: false } }, // Because I was an idiot and forgot to add the field.
        { done: { $eq: false } }
      ]
    });
  }

  if (options.repeatable != null) {
    args.push({ repeatable: { $eq: options.repeatable } });
  }

  if (args.length > 0) {
    request.selector.$and = args;
  }

  const all = await recipesDb.find(request);

  return all.docs;
}

export async function getRecipe(id: string): Promise<IRecipe | null> {
  try {
    await waitForRecipeData();

    const recipe = await recipesDb.get(id);

    return recipe;
  } catch (e) {
    if (e.name === "not_found") {
      return null;
    }

    throw e;
  }
}

interface IGetItemsOptions extends IPaginationOptions {
  query?: string;
  usageStatus?: "withoutPendingRecipes" | "withPendingRecipes";
}

export async function getItems(options: IGetItemsOptions = {}) {
  await waitForItemData();

  const request: PouchDB.Find.FindRequest<IItem> = {
    selector: { $and: [] },
    skip: options.skip,
    limit: options.limit
  };

  if (options.usageStatus) {
    let recipesInDesiredState: IRecipe[] = [];

    const itemIds = new Set<string>();

    switch (options.usageStatus) {
      case "withoutPendingRecipes":
        recipesInDesiredState = await getRecipes({
          done: true,
          repeatable: false
        });
        break;
      case "withPendingRecipes":
        recipesInDesiredState = await getRecipes({
          done: false
        });
        break;
    }

    for (const r of recipesInDesiredState) {
      for (const item of r.items) {
        itemIds.add(item.item._id);
      }
    }

    // Second pass, to catch items which may still be in one or more recipes...
    if (options.usageStatus === "withoutPendingRecipes") {
      console.debug(
        "Need to do a second pass to remove items that might still be needed..."
      );
      const itemsThatAreStillInUse = await Promise.all(
        Array.from(itemIds).map(async id => {
          const usedInRecipes = await recipesDb.find({
            selector: {
              $and: [
                { items: { $elemMatch: { "item._id": { $eq: id } } } },
                {
                  $or: [
                    { done: { $exists: false } }, // Because I was an idiot and forgot to add the field.
                    { done: { $eq: false } }
                  ]
                }
              ]
            }
          });

          if (usedInRecipes.docs.length > 0) {
            return id;
          }

          return null;
        })
      );

      for (const id of itemsThatAreStillInUse) {
        if (id != null) {
          itemIds.delete(id);
        }
      }
    }

    request.selector.$and!.push({ _id: { $in: Array.from(itemIds) } });
  }

  if (options.query) {
    request.selector.$and!.push({
      name: { $regex: new RegExp(options.query, "i") }
    });
  }

  const all = await itemsDb.find(request);

  return all.docs;
}

export async function getItem(id: string): Promise<IItem | null> {
  try {
    await waitForItemData();

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
  await Promise.all([waitForItemData(), waitForRecipeData()]);

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
  await waitForItemData();

  const existing = await getRecipe(recipe._id);

  if (existing == null) {
    throw new Error("Recipe not found.");
  }

  existing.done = !existing.done;

  await recipesDb.put(existing);

  return existing;
}

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
