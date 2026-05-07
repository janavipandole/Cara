import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
          <h1>Something went wrong</h1>
          <pre style={{ color: 'red' }}>{this.state.error?.message}</pre>
          <p>Please check the browser console for details.</p>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary