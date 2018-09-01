import * as React from "react";
import { ItemType, IItem } from "src/data/api-types";

const typeIcons: Record<ItemType, React.ReactElement<any>> = {
  armour: <span>🛡️</span>,
  healingItem: <span>💊</span>,
  keyItem: <span>🔑</span>,
  loot: <span>📦</span>,
  weapon: <span>⚔️</span>
};

export function ItemIcon(props: { item: IItem }) {
  const icon = typeIcons[props.item.type];

  if (icon == null) {
    return <span>❓</span>;
  }

  return icon;
}
