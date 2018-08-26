import "src/RecipeItems.css";

import * as React from "react";

import { Link } from "react-router-dom";

import { IRecipeItem } from "./data/api";
import { ItemIcon } from "./ItemTypeIcon";

export function RecipeItems({ items }: { items: IRecipeItem[] }) {
  return (
    <div className="CustomList">
      {items.map(i => (
        <Link
          key={i.item._id}
          className="CustomListItem RecipeItem"
          to={`/items/${i.item._id}`}
        >
          <ItemIcon item={i.item} />
          &nbsp;
          <span>{i.item.name}</span>
          <span className="CustomListItemBadge">{i.quantity}x</span>
        </Link>
      ))}
    </div>
  );
}
