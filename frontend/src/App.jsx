import { useState } from 'react'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('login') // 'login', 'register', 'forgot-password'
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    name: '', dob: '', location: '', email: '', mobile: '', password: ''
  })
  const [forgotForm, setForgotForm] = useState({ email: '' })
  const [resetForm, setResetForm] = useState({ email: '', otp: '', newPassword: '' })

  const API_BASE = 'http://localhost:5000/api'

  // Handle form changes
  const handleInputChange = (formType, field, value) => {
    switch (formType) {
      case 'login':
        setLoginForm(prev => ({ ...prev, [field]: value }))
        break
      case 'register':
        setRegisterForm(prev => ({ ...prev, [field]: value }))
        break
      case 'forgot':
        setForgotForm(prev => ({ ...prev, [field]: value }))
        break
      case 'reset':
        setResetForm(prev => ({ ...prev, [field]: value }))
        break
    }
  }

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setMessage('Login successful!')
        localStorage.setItem('token', data.token)
      } else {
        setMessage(data.msg || 'Login failed')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const formData = new FormData()
      Object.keys(registerForm).forEach(key => {
        formData.append(key, registerForm[key])
      })

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setMessage('Registration successful!')
        localStorage.setItem('token', data.token)
      } else {
        setMessage(data.msg || 'Registration failed')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Forgot password function
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${API_BASE}/password/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forgotForm)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('OTP sent! Check server console for OTP code.')
        setCurrentView('reset-password')
      } else {
        setMessage(data.msg || 'Failed to send OTP')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Reset password function
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${API_BASE}/password/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetForm)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Password reset successful!')
        setCurrentView('login')
      } else {
        setMessage(data.msg || 'Password reset failed')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    setMessage('Logged out successfully!')
  }

  // If user is logged in, show dashboard
  if (user) {
    return (
      <div className="app">
        <div className="container">
          <h1>🎮 PlayConnect Dashboard</h1>
          <div className="user-info">
            <h2>Welcome, {user.name}!</h2>
            <p>Email: {user.email}</p>
            {user.profileImage && <img src={user.profileImage} alt="Profile" className="profile-image" />}
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
          {message && <div className="message success">{message}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="container">
        <h1>🎮 PlayConnect</h1>
        
        {/* Navigation */}
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${currentView === 'login' ? 'active' : ''}`}
            onClick={() => setCurrentView('login')}
          >
            Login
          </button>
          <button 
            className={`nav-tab ${currentView === 'register' ? 'active' : ''}`}
            onClick={() => setCurrentView('register')}
          >
            Register
          </button>
          <button 
            className={`nav-tab ${currentView === 'forgot-password' ? 'active' : ''}`}
            onClick={() => setCurrentView('forgot-password')}
          >
            Forgot Password
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Login Form */}
        {currentView === 'login' && (
          <form onSubmit={handleLogin} className="form">
            <h2>Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => handleInputChange('login', 'email', e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => handleInputChange('login', 'password', e.target.value)}
              required
            />
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {currentView === 'register' && (
          <form onSubmit={handleRegister} className="form">
            <h2>Register</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={registerForm.name}
              onChange={(e) => handleInputChange('register', 'name', e.target.value)}
              required
            />
            <input
              type="date"
              placeholder="Date of Birth"
              value={registerForm.dob}
              onChange={(e) => handleInputChange('register', 'dob', e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={registerForm.location}
              onChange={(e) => handleInputChange('register', 'location', e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) => handleInputChange('register', 'email', e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Mobile Number"
              value={registerForm.mobile}
              onChange={(e) => handleInputChange('register', 'mobile', e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={(e) => handleInputChange('register', 'password', e.target.value)}
              required
            />
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

        {/* Forgot Password Form */}
        {currentView === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="form">
            <h2>Forgot Password</h2>
            <input
              type="email"
              placeholder="Email"
              value={forgotForm.email}
              onChange={(e) => handleInputChange('forgot', 'email', e.target.value)}
              required
            />
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Reset Password Form */}
        {currentView === 'reset-password' && (
          <form onSubmit={handleResetPassword} className="form">
            <h2>Reset Password</h2>
            <input
              type="email"
              placeholder="Email"
              value={resetForm.email}
              onChange={(e) => handleInputChange('reset', 'email', e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="OTP (6 digits)"
              value={resetForm.otp}
              onChange={(e) => handleInputChange('reset', 'otp', e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={resetForm.newPassword}
              onChange={(e) => handleInputChange('reset', 'newPassword', e.target.value)}
              required
            />
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default App
