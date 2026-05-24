import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import PostCard from '../components/PostCard.jsx'

const TABS = [
  { id: 'newest', label: 'Newest', icon: '🕐' },
  { id: 'trending', label: 'Trending', icon: '📈' },
  { id: 'popular', label: 'Popular', icon: '🔥' },
  { id: 'media', label: 'Media', icon: '🖼' }
]

function PostSkeleton() {
  return (
    <div className="card" style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.875rem', padding: '1rem 1.25rem' }}>
      <div>
        <div className="skeleton" style={{ width: 36, height: 80, borderRadius: 'var(--radius-sm)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 12, width: '25%', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ height: 12, width: '85%', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ height: 12, width: '40%' }} />
      </div>
    </div>
  )
}

export default function Feed() {
  const { user, ready } = useAuth()
  const [tab, setTab] = useState('newest')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [fetchError, setFetchError] = useState('')

  const fetchPosts = useCallback(async (t, p, replace = false) => {
    try {
      p === 1 ? setLoading(true) : setLoadingMore(true)
      const r = await fetch(`/api/posts?tab=${t}&page=${p}`)
      if (!r.ok) throw new Error('Failed')
      const data = await r.json()
      setPosts(prev => replace || p === 1 ? data : [...prev, ...data])
      setHasMore(data.length === 20)
    } catch {
      setFetchError('Failed to load posts. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    setPage(1)
    fetchPosts(tab, 1, true)
  }, [tab, fetchPosts])

  const handleVote = async (postId, voteType) => {
    if (!user) { window.location.href = '/login'; return }
    try {
      const r = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: postId, targetType: 'post', voteType })
      })
      const data = await r.json()
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        const prev_vote = p.userVote
        let up = p.upvotes, down = p.downvotes
        if (prev_vote === 'up') up--
        if (prev_vote === 'down') down--
        if (data.voteType === 'up') up++
        if (data.voteType === 'down') down++
        return { ...p, upvotes: up, downvotes: down, userVote: data.voteType }
      }))
    } catch {}
  }

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchPosts(tab, next)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1.25rem' }}>
      <div className="page-layout">
        <main>
          {/* Tabs */}
          <div className="tabs">
            {TABS.map(t => (
              <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
            <button
              onClick={() => fetchPosts(tab, 1, true)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}
              title="Refresh"
            >
              ↻
            </button>
          </div>

          {/* Content */}
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <PostSkeleton key={i} />)
          ) : fetchError ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>
              {fetchError}
              <br />
              <button className="btn btn-outline btn-sm" onClick={() => fetchPosts(tab, 1, true)} style={{ marginTop: '0.75rem' }}>
                Retry
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                {tab === 'media' ? '🖼' : '📝'}
              </div>
              <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Nothing here yet</h3>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem' }}>
                {tab === 'trending' ? 'Posts gain traction as they get upvotes and comments.' : 'Be the first to post!'}
              </p>
              <Link to="/create" className="btn btn-primary">Create the first post</Link>
            </div>
          ) : (
            <>
              {posts.map(post => (
                <PostCard key={post.id} post={post} onVote={handleVote} />
              ))}
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button className="btn btn-outline" onClick={loadMore} disabled={loadingMore} style={{ minWidth: 120 }}>
                    {loadingMore ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Sidebar */}
        <aside className="sidebar">
          {!user && ready && (
            <div className="card" style={{ marginBottom: '1rem', borderTop: '3px solid var(--gold-500)' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Join OCR-now
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Post anonymously, join discussions, upvote helpful content. Cambridge National students only.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/signup" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Sign up</Link>
                <Link to="/login" className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Sign in</Link>
              </div>
            </div>
          )}

          <div className="card">
            <h3 style={{ margin: '0 0 0.875rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Community
            </h3>
            {[
              { label: 'Anonymous posts', value: '🔒 Protected' },
              { label: 'Data sold', value: '❌ Never' },
              { label: 'Tracking', value: '❌ None' },
              { label: 'Moderation', value: '✅ Active' }
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                <span style={{ fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
