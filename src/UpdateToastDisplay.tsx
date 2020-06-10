import React from "react";
import ReactDOM from "react-dom";
import { appUpdateSubject$, UpdateType } from "./serviceWorker";
import { Subscription } from "rxjs";
import { Toast } from "./Toast";

export class UpdateToastDisplay extends React.Component {
  private updateSubscription: Subscription | null = null;

  public componentDidMount() {
    this.updateSubscription = appUpdateSubject$.subscribe(this.handleUpdate);
  }

  public componentWillUnmount() {
    this.updateSubscription?.unsubscribe();
  }

  private handleUpdate = (update: UpdateType) => {
    const el = document.createElement("div");

    el.classList.add("ToastOverlay");

    document.body.appendChild(el);

    let element: React.ReactElement<any> | null = null;

    switch (update) {
      case "availableOffline":
        element = (
          <Toast timeout={5000} onHide={() => el.remove()}>
            App available for online use!
          </Toast>
        );
        break;
      case "updated":
        element = (
          <Toast timeout={5000} onHide={() => el.remove()}>
            There's an update available!
            <br />
            Refresh to see the latest changes.
          </Toast>
        );
    }

    if (element != null) {
      ReactDOM.render(element, el);
    } else {
      el.remove();
    }
  };

  public render() {
    return null;
  }
}
