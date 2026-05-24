import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--purple-900)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(212,160,23,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(212,160,23,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.75rem', color: 'var(--gold-400)' }}>OCR</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.75rem', color: 'var(--cream)' }}>now</span>
          </div>
          <p style={{ color: 'rgba(250,248,244,0.6)', fontSize: '0.875rem' }}>{subtitle}</p>
        </div>

        <div className="card" style={{ background: 'var(--bg-secondary)', borderTop: '3px solid var(--gold-500)' }}>
          <h1 style={{ margin: '0 0 1.25rem', fontSize: '1.15rem' }}>{title}</h1>
          {children}
        </div>
      </div>
    </div>
  )
}

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setErr('')
    try {
      await login(email, password)
      navigate('/feed')
    } catch (e) {
      setErr(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Sign in" subtitle="Cambridge National Community">
      {err && <div className="alert alert-error">{err}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
        </div>
        <div>
          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <input className="input" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" style={{ paddingRight: '2.5rem' }} />
            <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              {showPw ? '🙈' : '👁'}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.625rem', marginTop: '0.25rem' }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div className="divider">or</div>
      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Don't have an account? <Link to="/signup" style={{ color: 'var(--purple-600)', fontWeight: 600 }}>Create one</Link>
      </p>
    </AuthCard>
  )
}

export function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setErr('')
    try {
      await signup(email, password, name)
      navigate('/feed')
    } catch (e) {
      setErr(e.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Create account" subtitle="Join the Cambridge National community">
      {err && <div className="alert alert-error">{err}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label>Display name</label>
          <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required autoComplete="name" />
        </div>
        <div>
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
        </div>
        <div>
          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <input className="input" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} autoComplete="new-password" style={{ paddingRight: '2.5rem' }} />
            <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              {showPw ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <div className="alert alert-info" style={{ fontSize: '0.8rem', display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
          👤 <span>You can post anonymously any time. Your identity stays private.</span>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.625rem', marginTop: '0.25rem' }}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <div className="divider">or</div>
      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--purple-600)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </AuthCard>
  )
}
