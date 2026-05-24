import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { fullDate } from '../lib/time.js'
import RoleBadge from '../components/RoleBadge.jsx'
import PostCard from '../components/PostCard.jsx'

export default function Profile() {
  const { id } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [viewerRole, setViewerRole] = useState('member')
  const [modAction, setModAction] = useState('')

  const isOwn = user?.id === id
  const isMod = viewerRole === 'moderator' || viewerRole === 'admin'
  const isAdmin = viewerRole === 'admin'

  useEffect(() => {
    setLoading(true)
    fetch(`/api/profile/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setProfile(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (user) {
      fetch(`/api/profile/${user.id}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setViewerRole(d.role || 'member') })
        .catch(() => {})
    }
  }, [user])

  // Fetch user posts (public non-anonymous ones)
  useEffect(() => {
    if (!id) return
    fetch(`/api/posts?author=${id}`)
      .then(r => r.ok ? r.json() : [])
      .then(setPosts)
      .catch(() => {})
  }, [id])

  const handleBan = async () => {
    if (!profile) return
    const action = profile.isBanned ? 'Unban' : 'Ban'
    if (!confirm(`${action} ${profile.username}?`)) return
    setModAction('ban')
    await fetch('/api/mod/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: profile.id, banned: !profile.isBanned })
    })
    setProfile({ ...profile, isBanned: !profile.isBanned })
    setModAction('')
  }

  const handlePromote = async (role) => {
    if (!profile || !confirm(`Set ${profile.username}'s role to ${role}?`)) return
    setModAction('promote')
    const r = await fetch('/api/mod/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: profile.id, role })
    })
    if (r.ok) {
      const data = await r.json()
      setProfile({ ...profile, role: data.role })
    }
    setModAction('')
  }

  const RolePill = () => {
    if (profile.isBanned) return <span className="badge badge-red">Banned</span>
    if (profile.role === 'admin') return <span className="badge badge-gold">★ Admin</span>
    if (profile.role === 'moderator') return <span className="badge badge-purple">⚖ Mod</span>
    if (profile.role === 'verified' || profile.isVerified) return <span className="badge badge-purple">✓ Verified</span>
    return <span className="badge badge-green">Member</span>
  }

  if (loading) return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem 1.25rem' }}>
      <div className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-lg)', marginBottom: '1rem' }} />
    </div>
  )

  if (notFound || !profile) return (
    <div style={{ maxWidth: 760, margin: '4rem auto', padding: '0 1.25rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
      <h2 style={{ marginBottom: '0.5rem' }}>Profile not found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>This user doesn't have a public profile yet.</p>
      {isOwn && <Link to="/settings" className="btn btn-primary">Set up your profile</Link>}
    </div>
  )

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem 1.25rem' }}>
      {/* Profile card */}
      <div className="card" style={{ marginBottom: '1.25rem', borderTop: '3px solid var(--purple-500)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--purple-100)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.currentTarget.style.display = 'none'} />
            ) : (
              <span style={{ fontSize: '1.75rem', color: 'var(--purple-400)' }}>
                {(profile.displayName || profile.username || '?')[0].toUpperCase()}
              </span>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{profile.displayName}</h1>
              <RoleBadge role={profile.role} isVerified={profile.isVerified} />
              <RolePill />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>@{profile.username}</div>
            {profile.bio && <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', lineHeight: 1.6 }}>{profile.bio}</p>}
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span>📅 Joined {fullDate(profile.createdAt)}</span>
              <span><strong style={{ color: 'var(--text-primary)' }}>{profile.postCount}</strong> posts</span>
            </div>
          </div>

          {isOwn && (
            <Link to="/settings" className="btn btn-outline btn-sm">✏ Edit profile</Link>
          )}
        </div>
      </div>

      {/* Mod panel */}
      {isMod && !isOwn && profile && (
        <div className="card" style={{ marginBottom: '1.25rem', borderLeft: '3px solid var(--gold-500)' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--gold-600)' }}>⚖ Moderation</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className={profile.isBanned ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'} onClick={handleBan} disabled={!!modAction}>
              {profile.isBanned ? '✓ Unban' : '🚫 Ban user'}
            </button>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Role:</span>
            {['member', 'verified', 'moderator'].map(r => (
              <button key={r} className={profile.role === r ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'} onClick={() => handlePromote(r)} disabled={!!modAction || profile.role === r} style={{ textTransform: 'capitalize' }}>
                {r}
              </button>
            ))}
            {isAdmin && (
              <button className={profile.role === 'admin' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'} onClick={() => handlePromote('admin')} disabled={!!modAction || profile.role === 'admin'}>
                Admin
              </button>
            )}
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {profile.id.slice(0, 16)}…</div>
        </div>
      )}

      {/* Posts */}
      <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
        Posts by {profile.displayName}
      </h3>
      {posts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
          No public posts yet.
        </div>
      ) : (
        posts.map(p => <PostCard key={p.id} post={p} />)
      )}
    </div>
  )
}
