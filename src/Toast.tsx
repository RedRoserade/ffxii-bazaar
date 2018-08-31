import React from "react";

export class Toast extends React.Component<{
  children: React.ReactNode;
  timeout: number;
  onHide?(): void;
}> {
  private timeoutId?: number;

  public state = {
    show: true
  };

  public componentDidUpdate(_: never, prevState: { show: boolean }) {
    if (
      this.props.onHide != null &&
      this.state.show === false &&
      prevState.show === true
    ) {
      this.props.onHide();
    }
  }

  public componentDidMount() {
    this.timeoutId = window.setTimeout(
      () => this.setState({ show: false }),
      this.props.timeout
    );
  }

  public componentWillUnmount() {
    if (this.timeoutId != null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  public render() {
    if (!this.state.show) {
      return null;
    }

    return <div className="Toast">{this.props.children}</div>;
  }
}
