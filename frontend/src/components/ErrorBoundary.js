import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container">
          <div className="card">
            <div className="error" style={{ textAlign: 'center', padding: '40px' }}>
              <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>⚠️ Something went wrong</h2>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => window.location.href = '/'}
                >
                  Go Home
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details style={{ marginTop: '20px', textAlign: 'left' }}>
                  <summary style={{ cursor: 'pointer', color: '#007bff' }}>
                    Error Details (Development)
                  </summary>
                  <pre style={{ 
                    background: '#f8f9fa', 
                    padding: '12px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'auto',
                    marginTop: '8px'
                  }}>
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 