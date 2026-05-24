import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { timeAgo } from '../lib/time.js'
import RoleBadge from './RoleBadge.jsx'

export default function PostCard({ post, onVote }) {
  const { user } = useAuth()
  const score = post.upvotes - post.downvotes

  const handleVote = (type) => {
    if (!user) { window.location.href = '/login'; return }
    onVote?.(post.id, type)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
  }

  return (
    <article className={`post-card animate-in ${post.isPinned ? 'pinned' : ''} ${post.isHighlighted ? 'highlighted' : ''}`}>
      {(post.isPinned || post.isHighlighted) && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
          {post.isPinned && <span style={{ color: 'var(--gold-600)' }}>📌 Pinned</span>}
          {post.isHighlighted && <span style={{ color: 'var(--purple-500)' }}>★ Highlighted</span>}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.875rem' }}>
        {/* Vote column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', minWidth: 38 }}>
          <button
            className={`vote-btn ${post.userVote === 'up' ? 'up-active' : ''}`}
            onClick={() => handleVote('up')}
            style={{ flexDirection: 'column', padding: '0.3rem 0.4rem' }}
          >
            ▲
          </button>
          <span style={{
            fontSize: '0.85rem', fontWeight: 700,
            color: score > 0 ? 'var(--purple-600)' : score < 0 ? 'var(--danger)' : 'var(--text-muted)'
          }}>
            {score}
          </span>
          <button
            className={`vote-btn ${post.userVote === 'down' ? 'down-active' : ''}`}
            onClick={() => handleVote('down')}
            style={{ flexDirection: 'column', padding: '0.3rem 0.4rem' }}
          >
            ▼
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            {post.postType !== 'text' && (
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {post.postType === 'image' ? '🖼 Image' : '🔗 Link'}
              </span>
            )}
            {post.isAnonymous ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                👤 anonymous
              </span>
            ) : (
              <Link
                to={`/profile/${post.authorId}`}
                style={{ fontSize: '0.8rem', color: 'var(--purple-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                {post.authorUsername || 'user'}
                <RoleBadge role={post.authorRole} isVerified={post.authorIsVerified} />
              </Link>
            )}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{timeAgo(post.createdAt)}</span>
            {post.isNsfw && <span className="badge badge-red">NSFW</span>}
            {post.tags && post.tags.split(',').slice(0, 3).map(t => t.trim()).filter(Boolean).map(t => (
              <span key={t} className="badge badge-purple">{t}</span>
            ))}
          </div>

          {/* Title */}
          <Link
            to={`/post/${post.id}`}
            style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: '0.4rem' }}
          >
            {post.title}
          </Link>

          {/* Preview */}
          {post.postType === 'text' && post.content && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '0.5rem' }}>
              {post.content}
            </p>
          )}
          {post.postType === 'image' && post.imageUrl && (
            <div style={{ marginBottom: '0.5rem', borderRadius: 'var(--radius)', overflow: 'hidden', maxHeight: 240 }}>
              <img src={post.imageUrl} alt={post.title} style={{ width: '100%', objectFit: 'cover', maxHeight: 240 }} onError={e => e.currentTarget.style.display = 'none'} />
            </div>
          )}
          {post.postType === 'link' && post.linkUrl && (
            <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--purple-500)', background: 'var(--bg-accent)', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', marginBottom: '0.5rem' }}>
              🔗 {post.linkUrl.replace(/^https?:\/\//, '').slice(0, 60)}
            </a>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Link
              to={`/post/${post.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-accent)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
            >
              💬 {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
            </Link>
            <button
              onClick={copyLink}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-accent)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
            >
              🔗 Share
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
