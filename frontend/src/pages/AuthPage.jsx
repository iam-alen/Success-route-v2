import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../AuthContext'

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup'
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (isSignup && form.password !== form.confirm) return setError('Passwords do not match.')
    setLoading(true)
    try {
      const data = isSignup
        ? await api.register(form.name, form.email, form.password)
        : await api.login(form.email, form.password)
      login(data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <Link to="/" className="logo center-text">success route<span className="dot">.</span></Link>
        <h2>{isSignup ? 'Create an account' : 'Welcome back'}</h2>
        <p className="muted">{isSignup ? 'Start mapping your career today.' : 'Sign in to continue your journey.'}</p>

        {isSignup && (
          <>
            <label>Full name</label>
            <input value={form.name} onChange={set('name')} placeholder="Your name" required />
          </>
        )}

        <label>Email</label>
        <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />

        <label>Password</label>
        <input type="password" value={form.password} onChange={set('password')} placeholder="At least 6 characters" required minLength={6} />

        {isSignup && (
          <>
            <label>Confirm password</label>
            <input type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" required />
          </>
        )}

        {error && <div className="error">{error}</div>}

        <button className="btn btn-primary btn-block mt" disabled={loading}>
          {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
        </button>

        <p className="center-text small mt">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <Link to={isSignup ? '/signin' : '/signup'}>{isSignup ? 'Sign in' : 'Sign up'}</Link>
        </p>
      </form>
    </div>
  )
}
