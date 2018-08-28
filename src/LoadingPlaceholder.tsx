import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ILoadingPlaceholderProps {
  timeout?: number;
  children(
    state: ILoadingPlaceholderState
  ): React.ReactElement<any> | null | undefined;
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

  public componentWillUnmount() {
    if (this.timeoutId != null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  public render() {
    return this.props.children(this.state);
  }
}

interface ILoadingPlaceholderSpinnerProps {
  timeout?: number;
}

export function LoadingPlaceholderSpinner(
  props: ILoadingPlaceholderSpinnerProps
) {
  return (
    <LoadingPlaceholder {...props}>
      {({ show }) => (show ? <LoadingSpinner /> : null)}
    </LoadingPlaceholder>
  );
}

export function LoadingSpinner() {
  return (
    <div className="LoadingSpinner">
      <FontAwesomeIcon icon="spinner" spin={true} />
    </div>
  );
}
