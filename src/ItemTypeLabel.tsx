import * as React from "react";
import { ItemType, IItem } from "./data";

const typeLabels: Record<ItemType, React.ReactElement<any>> = {
  armour: <span>Armour</span>,
  healingItem: <span>Item</span>,
  keyItem: <span>Key Item</span>,
  loot: <span>Loot</span>,
  weapon: <span>Weapon</span>
};

export function ItemTypeLabel(props: { item: IItem }) {
  const label = typeLabels[props.item.type];

  if (label == null) {
    return <span>Unknown</span>;
  }

  return label;
}