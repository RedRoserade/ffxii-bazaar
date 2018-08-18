import * as React from "react";
import { Route } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function BackButton() {
  return (
    <Route>
      {({ history }) => {
        if (history.length === 0) {
          return null;
        }

        return (
          <button
            type="button"
            className={"BackButton"}
            onClick={() => history.goBack()}
          >
            <FontAwesomeIcon icon="chevron-left" size="lg" />
          </button>
        );
      }}
    </Route>
  );
}
