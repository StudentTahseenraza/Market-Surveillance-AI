// frontend/src/components/common/ErrorBoundary.jsx
import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console with details
    console.group('❌ Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.groupEnd();
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Check if it's a Chart.js error
      const isChartError = this.state.error?.message?.includes('Canvas') || 
                          this.state.error?.message?.includes('arc') ||
                          this.state.error?.message?.includes('Chart');

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center">
              <div className="bg-red-100 p-4 rounded-full">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-600" />
              </div>
            </div>
            
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              {isChartError ? 'Chart Rendering Error' : 'Something went wrong'}
            </h2>
            
            <p className="mt-3 text-gray-600">
              {isChartError 
                ? 'There was an issue rendering the charts. This is usually a temporary issue.'
                : this.state.error?.message || 'An unexpected error occurred'}
            </p>

            {isChartError && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
                <p className="text-sm text-blue-800 font-medium">🛠️ Quick Fix:</p>
                <p className="text-sm text-blue-700 mt-1">
                  This is a Chart.js registration issue. The page will reload with all chart components properly registered.
                </p>
              </div>
            )}
            
            <div className="mt-8 space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full btn-primary inline-flex items-center justify-center"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Reload Application
              </button>
              
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full btn-outline"
              >
                Go to Dashboard
              </button>
            </div>

            {this.props.fallback}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;