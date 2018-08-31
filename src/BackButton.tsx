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
            className={"PageHeaderButton"}
            onClick={() => history.goBack()}
            aria-label="Go Back"
            title="Go Back"
          >
            <FontAwesomeIcon icon="chevron-left" size="lg" />
          </button>
        );
      }}
    </Route>
  );
}
