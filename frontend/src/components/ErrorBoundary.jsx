import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger m-3">
          <h3>Something went wrong</h3>
          <button 
            className="btn btn-primary mt-2"
            onClick={() => window.location.reload()}
          >
            Reload Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}