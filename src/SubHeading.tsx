import * as React from "react";

export function SubHeading(props: any) {
  const { children, ...rest } = props;
  return (
    <h2 className={`SubHeading ${rest.className || ""}`} {...rest}>
      {children}
    </h2>
  );
}

export function SubSubHeading(props: any) {
  const { children, ...rest } = props;
  return (
    <h3 className={`SubSubHeading ${rest.className || ""}`} {...rest}>
      {children}
    </h3>
  );
}
