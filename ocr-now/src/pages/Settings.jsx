import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export default function Settings() {
  const { user, logout, setUser } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState('')
  const [saveOk, setSaveOk] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetch(`/api/profile/${user.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          setDisplayName(d.displayName || d.name || '')
          setUsername(d.username || '')
          setBio(d.bio || '')
          setAvatarUrl(d.avatarUrl || '')
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, navigate])

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    setSaveErr('')
    setSaveOk(false)
    try {
      const r = await fetch(`/api/profile/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, username, bio, avatarUrl })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Failed to save')
      setSaveOk(true)
      setTimeout(() => setSaveOk(false), 3000)
    } catch (e) {
      setSaveErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user || loading) return <div style={{ minHeight: '100vh' }} />

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem 1.25rem' }}>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.35rem' }}>Settings</h1>

      {/* Profile section */}
      <section className="card" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          👤 Profile
        </h2>

        {saveErr && <div className="alert alert-error">{saveErr}</div>}
        {saveOk && <div className="alert alert-success">✓ Profile saved!</div>}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Avatar preview + URL */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--purple-100)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.currentTarget.style.display = 'none'} />
              ) : (
                <span style={{ fontSize: '1.5rem', color: 'var(--purple-400)' }}>
                  {(displayName || 'U')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label>Avatar URL</label>
              <input className="input" type="url" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://example.com/avatar.jpg" />
            </div>
          </div>

          <div>
            <label>Display name</label>
            <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" maxLength={50} required />
          </div>

          <div>
            <label>Username</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="username" maxLength={30} required />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Letters, numbers, and underscores only</div>
          </div>

          <div>
            <label>Bio</label>
            <textarea className="input" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell others a bit about yourself…" rows={3} maxLength={300} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>{bio.length}/300</div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: 'fit-content' }}>
            {saving ? 'Saving…' : '💾 Save profile'}
          </button>
        </form>
      </section>

      {/* Account section */}
      <section className="card" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
        <h2 style={{ margin: '0 0 0.875rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🔐 Account
        </h2>

        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
          <div style={{ marginBottom: '0.35rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Email:</strong> {user.email}
          </div>
          <div style={{ marginBottom: '0.35rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Role:</strong> {user.role}
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Member ID:</strong>{' '}
            <code>{user.id.slice(0, 16)}…</code>
          </div>
        </div>

        <div className="alert alert-info" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
          👤 Your email is never shown publicly. Anonymous posts cannot be linked back to your account.
        </div>

        <button onClick={handleLogout} className="btn btn-danger btn-sm">Sign out</button>
      </section>

      <Link to={`/profile/${user.id}`} style={{ fontSize: '0.875rem', color: 'var(--purple-600)' }}>
        View public profile →
      </Link>
    </div>
  )
}
