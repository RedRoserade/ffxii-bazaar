import * as React from "react";
import { ItemType, IItem } from "./data/api-types";

const typeIcons: Record<ItemType, React.ReactElement<any>> = {
  armour: <span role="img" aria-label="Armour">🛡️</span>,
  healingItem: <span role="img" aria-label="Item">💊</span>,
  keyItem: <span role="img" aria-label="Key item">🔑</span>,
  loot: <span role="img" aria-label="Loot">📦</span>,
  weapon: <span role="img" aria-label="Weapon">⚔️</span>
};

export function ItemIcon(props: { item: IItem }) {
  const icon = typeIcons[props.item.type];

  if (icon == null) {
    return <span role="img" aria-label="Unknown">❓</span>;
  }

  return icon;
}
