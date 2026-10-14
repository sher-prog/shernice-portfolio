import { Component } from 'react'

// Last line of defence: if anything throws while rendering, show the essentials
// instead of a blank page.
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error('[portfolio]', error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main style={{ padding: '12vh 24px', maxWidth: 560, margin: '0 auto', fontFamily: 'Georgia, serif', color: '#2a241c' }}>
        <h1>Shernice Chetty</h1>
        <p>Something went wrong loading this page. Please refresh, or reach me directly:</p>
        <p>
          <a href="mailto:shernicechetty02@gmail.com">Email</a> ·{' '}
          <a href="https://www.linkedin.com/in/shernice-chetty">LinkedIn</a> ·{' '}
          <a href="https://github.com/sher-prog">GitHub</a>
        </p>
      </main>
    )
  }
}
