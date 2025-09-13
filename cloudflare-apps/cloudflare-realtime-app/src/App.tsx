import { useState, useEffect } from 'react'
import { PollPage } from './components/PollPage'
import { LoginForm } from './components/LoginForm'
import { UserDashboard } from './components/UserDashboard'
import './App.css'

interface User {
  id: string;
  username: string;
  created_at: string;
}

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'poll'>('home')
  const [currentPollId, setCurrentPollId] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on app load
  useEffect(() => {
    checkSession()
  }, [])

  // Simple hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash.startsWith('#/poll/')) {
        const pollId = hash.split('#/poll/')[1]
        setCurrentPollId(pollId)
        setCurrentView('poll')
      } else {
        setCurrentView('home')
        setCurrentPollId(null)
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Session check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigateToPoll = (pollId: string) => {
    window.location.hash = `#/poll/${pollId}`
  }

  const navigateHome = () => {
    window.location.hash = '#/'
  }

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    setUser(null)
    navigateHome()
  }

  if (loading) {
    return (
      <div className="loading-container">
        Loading...
      </div>
    )
  }

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  // Show poll page if viewing a specific poll
  if (currentView === 'poll' && currentPollId) {
    return (
      <PollPage
        pollId={currentPollId}
        onBack={navigateHome}
      />
    )
  }

  // Show user dashboard
  return (
    <UserDashboard
      user={user}
      onLogout={handleLogout}
      onNavigateToPoll={navigateToPoll}
    />
  )
}

export default App
