import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function DataLoading() {
  return (
    <div className="DataLoading">
      <p>
        <FontAwesomeIcon icon="database" size="4x" />
      </p>

      <h1>Please wait.</h1>
      <h2>Loading data for recipes and items...</h2>
    </div>
  );
}
