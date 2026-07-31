import { Component, type ErrorInfo, type ReactNode } from "react";
import { describeTutorialEnv, logTutorialRender } from "./tutorial-route";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class TutorialErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("tutorial-render-error", {
      env: describeTutorialEnv(),
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
    logTutorialRender("error", { message: error.message });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="tut tut--fallback" role="alert">
          <header className="screen-header">
            <p className="eyebrow">Interactive tutorial</p>
            <h1>Tutorial failed to load</h1>
            <p className="screen-lede">Please refresh the page and try again.</p>
          </header>
          <p className="state-box state-box--error">
            If this keeps happening, open Home and tap &ldquo;Start the tutorial&rdquo; again.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
