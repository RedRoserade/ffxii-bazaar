import { recipesDb } from "src/data/recipes-db";
import { itemsDb } from "src/data/items-db";

import { waitForRecipeData, waitForItemData } from "src/data/sync";

import {
  IGetRecipesOptions,
  IRecipe,
  IGetItemsOptions,
  IItem,
  IRecipeItem
} from "src/data/api-types";

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

function getItemIdsFromRecipes(recipeList: IRecipe[]) {
  const ids = new Set<string>();

  for (const r of recipeList) {
    for (const item of r.items) {
      ids.add(item.item._id);
    }
  }

  return ids;
}

export async function getItems(options: IGetItemsOptions = {}) {
  await waitForItemData();

  const request: PouchDB.Find.FindRequest<IItem> = {
    selector: { $and: [] },
    skip: options.skip,
    limit: options.limit
  };

  if (options.usageStatus != null && options.usageStatus !== "all") {
    let itemIds = new Set<string>();

    switch (options.usageStatus) {
      case "withoutPendingRecipes": {
        // This is trickier than I'd like.
        // The problem is that one item can be used in many recipes,
        // and not all of them may be done.
        // So, I need to get all the recipes, and have auxiliary structures
        // that store the recipe states.
        // I can only consider items that no longer have an use in any recipe.
        // i.e., all the recipes that it's used on are not repeatable, and are done.
        const notDoneNonRepeatableRecipes = await getRecipes({
          repeatable: false,
          done: false
        });

        const doneNonRepeatableRecipes = await getRecipes({
          repeatable: false,
          done: true
        });

        const pendingIds = getItemIdsFromRecipes(notDoneNonRepeatableRecipes);

        itemIds = getItemIdsFromRecipes(doneNonRepeatableRecipes);

        for (const pendingId of pendingIds) {
          itemIds.delete(pendingId);
        }

        break;
      }
      case "withPendingRecipes": {
        const recipesInDesiredState = await getRecipes({
          done: false
        });

        itemIds = getItemIdsFromRecipes(recipesInDesiredState);

        break;
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
