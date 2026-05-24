import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export default function Nav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <span className="nav-logo-badge">OCR</span>
          <span className="nav-logo-text">now</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/feed" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Feed
          </NavLink>
          {user && (
            <NavLink to="/create" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              + Post
            </NavLink>
          )}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <Link
                to={`/profile/${user.id}`}
                style={{
                  color: 'rgba(250,248,244,0.8)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none'
                }}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.2)' }}
                  />
                ) : (
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'var(--purple-600)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, color: '#fff'
                  }}>
                    {(user.name || user.username || 'U')[0].toUpperCase()}
                  </span>
                )}
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name || user.username}
                </span>
                {user.role === 'admin' && (
                  <span style={{ fontSize: '0.65rem', background: 'var(--gold-500)', color: 'var(--purple-900)', padding: '0.1rem 0.35rem', borderRadius: 3, fontWeight: 700 }}>
                    ADMIN
                  </span>
                )}
                {user.role === 'moderator' && (
                  <span style={{ fontSize: '0.65rem', background: 'var(--purple-400)', color: '#fff', padding: '0.1rem 0.35rem', borderRadius: 3, fontWeight: 700 }}>
                    MOD
                  </span>
                )}
              </Link>
              <Link to="/settings" className="btn btn-ghost btn-sm">Settings</Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/signup" className="btn btn-gold btn-sm">Join</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
