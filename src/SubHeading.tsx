import * as React from "react";

export function SubHeading(props: any) {
  const { children, ...rest } = props;
  return <h2 className={`SubHeading ${rest.className || ""}`} {...rest}>{children}</h2>;
}
