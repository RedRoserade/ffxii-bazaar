import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ILoadingPlaceholderProps {
  timeout?: number;
}

interface ILoadingPlaceholderState {
  show: boolean;
}

export class LoadingPlaceholder extends React.Component<
  ILoadingPlaceholderProps,
  ILoadingPlaceholderState
> {
  private timeoutId?: number;

  constructor(props: ILoadingPlaceholderProps) {
    super(props);
    this.state = {
      show: props.timeout == null
    };
  }

  public componentDidMount() {
    if (this.props.timeout != null) {
      this.timeoutId = window.setTimeout(
        () => this.setState({ show: true }),
        this.props.timeout
      );
    }
  }

  public render() {
    if (!this.state.show) {
      return null;
    }

    return (
      <div className="LoadingPlaceholder">
        <FontAwesomeIcon icon="spinner" spin={true} />
      </div>
    );
  }
}
