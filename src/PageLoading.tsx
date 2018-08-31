import React from "react";
import { LoadingSpinner } from "src/LoadingPlaceholder";

export function PageLoading() {
  return (
    <div className="Page">
      <header className="PageHeader">
        <div className="PageHeaderRow">
          <div className="HeaderAndBackButton">
            <h1>Loading...</h1>
          </div>
        </div>
      </header>

      <LoadingSpinner />
    </div>
  );
}
