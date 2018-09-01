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

export interface IRecipeItemUsage {
  _id: string;
  recipe_id: string;
  item_id: string;
  quantity: number;
  role: "input" | "output";
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

export interface IPaginationOptions {
  skip?: number;
  limit?: number;
}

export interface IGetRecipesOptions extends IPaginationOptions {
  query?: string;
  done?: boolean;
  repeatable?: boolean;
}

export type UsageStatus =
  | "all"
  | "withoutPendingRecipes"
  | "withPendingRecipes";

export interface IGetItemsOptions extends IPaginationOptions {
  query?: string;
  usageStatus?: UsageStatus;
}
