import * as React from "react";
import { ItemType, IItem } from "./data/api-types";

const typeLabels: Record<ItemType, React.ReactElement<any>> = {
  armour: <span>Armour</span>,
  item: <span>Item</span>,
  keyItem: <span>Key Item</span>,
  loot: <span>Loot</span>,
  weapon: <span>Weapon</span>,
  accessory: <span>Accessory</span>,
  ammunition: <span>Ammunition</span>,
};

export function ItemTypeLabel(props: { item: IItem }) {
  const label = typeLabels[props.item.type];

  if (label == null) {
    return <span>Unknown</span>;
  }

  return label;
}
