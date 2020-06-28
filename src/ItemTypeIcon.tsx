import * as React from "react";
import { ItemType, IItem } from "./data/api-types";

function Emoji(props: { label: string; emoji: string }) {
  return (
    <span role="img" aria-label={props.label}>
      {props.emoji}
    </span>
  );
}

const typeIcons: Record<ItemType, React.ReactElement<any>> = {
  armour: <Emoji label="Armour" emoji="🛡️" />,
  item: <Emoji label="Item" emoji="🧪" />,
  keyItem: <Emoji label="Key item" emoji="🔑" />,
  loot: <Emoji label="Loot" emoji="📦" />,
  weapon: <Emoji label="Weapon" emoji="⚔️" />,
  accessory: <Emoji label="Accessory" emoji="💍" />,
  ammunition: <Emoji label="Ammunition" emoji="💣" />,
};

export function ItemIcon(props: { item: IItem }) {
  const icon = typeIcons[props.item.type];

  if (icon == null) {
    return <Emoji label="Unknown" emoji="❓" />;
  }

  return icon;
}
