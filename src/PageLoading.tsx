import React from "react";
import { LoadingSpinner } from "src/LoadingPlaceholder";
import { LoadingComponentProps } from "react-loadable";

export function PageLoading(props: LoadingComponentProps) {
  return (
    <div className="Page">
      <header className="PageHeader">
        <div className="PageHeaderRow">
          <div className="HeaderAndBackButton">
            {props.timedOut && <h1>Loading...</h1>}
          </div>
        </div>
      </header>

      {props.timedOut && <LoadingSpinner />}
    </div>
  );
}
