import React from "react";
import { LoadingSpinner } from "./LoadingPlaceholder";

export function PageLoading(props: any) {
  return (
    <div className="Page">
      <header className="PageHeader">
        <div className="PageHeaderRow">
          <div className="HeaderAndBackButton">
            <h1>{props.timedOut ? "Loading..." : <>&nbsp;</>}</h1>
          </div>
        </div>
      </header>

      {props.timedOut && <LoadingSpinner />}
    </div>
  );
}
