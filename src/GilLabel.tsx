import * as React from "react";

const nf = new Intl.NumberFormat([...navigator.languages], {
  maximumFractionDigits: 0,
  useGrouping: true
});

export function GilLabel({ gil }: { gil: number }) {
  return <>{nf.format(gil)} gil</>;
}
