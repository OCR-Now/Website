import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { timeAgo } from '../lib/time.js'
import RoleBadge from '../components/RoleBadge.jsx'

function CommentBlock({ comment, replies, onVote, onReply, onDelete, currentUserId, isMod, isReply = false }) {
  return (
    <div style={{ borderLeft: isReply ? '2px solid var(--border-light)' : 'none', paddingLeft: isReply ? '1.25rem' : 0, marginBottom: '0.875rem' }}>
      <div className="card" style={{ padding: '0.875rem', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {/* Vote */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', minWidth: 30 }}>
            <button className={`vote-btn ${comment.userVote === 'up' ? 'up-active' : ''}`} onClick={() => onVote(comment.id, 'up')} style={{ padding: '0.2rem 0.3rem' }}>▲</button>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: comment.upvotes > 0 ? 'var(--purple-600)' : 'var(--text-muted)' }}>{comment.upvotes}</span>
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              {comment.isAnonymous ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👤 anon</span>
              ) : (
                <Link to={`/profile/${comment.authorId}`} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--purple-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {comment.authorUsername || 'user'}
                  <RoleBadge role={comment.authorRole} isVerified={comment.authorIsVerified} />
                </Link>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeAgo(comment.createdAt)}</span>
            </div>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{comment.content}</p>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button onClick={() => onReply(comment.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', padding: '0.2rem 0.4rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                💬 Reply
              </button>
              {(isMod || comment.authorId === currentUserId) && (
                <button onClick={() => onDelete(comment.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.75rem', padding: '0.2rem 0.4rem', borderRadius: 'var(--radius-sm)' }}>
                  🗑 Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {replies.map(r => (
        <CommentBlock key={r.id} comment={r} replies={[]} onVote={onVote} onReply={onReply} onDelete={onDelete} currentUserId={currentUserId} isMod={isMod} isReply />
      ))}
    </div>
  )
}

export default function PostDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [isAnon, setIsAnon] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [userRole, setUserRole] = useState('member')

  useEffect(() => {
    fetch(`/api/post/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setPost(data.post); setComments(data.comments) })
      .catch(() => setErr('Post not found.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (user) {
      fetch(`/api/profile/${user.id}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setUserRole(d.role || 'member') })
        .catch(() => {})
    }
  }, [user])

  const isMod = userRole === 'moderator' || userRole === 'admin'

  const handleVote = async (targetId, targetType, voteType) => {
    if (!user) { navigate('/login'); return }
    const r = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId, targetType, voteType })
    })
    const data = await r.json()

    if (targetType === 'post' && post) {
      const prev = post.userVote
      let up = post.upvotes, down = post.downvotes
      if (prev === 'up') up--
      if (prev === 'down') down--
      if (data.voteType === 'up') up++
      if (data.voteType === 'down') down++
      setPost({ ...post, upvotes: up, downvotes: down, userVote: data.voteType })
    } else {
      setComments(prev => prev.map(c => {
        if (c.id !== targetId) return c
        const prev_vote = c.userVote
        let up = c.upvotes
        if (prev_vote === 'up') up--
        if (data.voteType === 'up') up++
        return { ...c, upvotes: up, userVote: data.voteType }
      }))
    }
  }

  const handleComment = async e => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const r = await fetch(`/api/post/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim(), parentId: replyTo, isAnonymous: isAnon })
      })
      if (!r.ok) throw new Error('Failed')
      const newComment = await r.json()
      setComments(prev => [newComment, ...prev])
      setCommentText('')
      setReplyTo(null)
      if (post) setPost({ ...post, commentCount: post.commentCount + 1 })
    } catch {
      alert('Failed to post comment.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/post/${post.id}`, { method: 'DELETE' })
    navigate('/feed')
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    await fetch('/api/mod/delete-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId })
    })
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  const handlePin = async () => {
    await fetch('/api/mod/pin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id, pinned: !post.isPinned }) })
    setPost({ ...post, isPinned: !post.isPinned })
  }

  const handleHighlight = async () => {
    await fetch('/api/mod/highlight', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id, highlighted: !post.isHighlighted }) })
    setPost({ ...post, isHighlighted: !post.isHighlighted })
  }

  if (loading) return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem 1.25rem' }}>
      <div className="skeleton" style={{ height: 200, marginBottom: '1rem', borderRadius: 'var(--radius-lg)' }} />
      <div className="skeleton" style={{ height: 120, marginBottom: '1rem', borderRadius: 'var(--radius-lg)' }} />
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: '0.75rem', borderRadius: 'var(--radius-lg)' }} />)}
    </div>
  )

  if (err || !post) return (
    <div style={{ maxWidth: 760, margin: '4rem auto', padding: '0 1.25rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
      <h2 style={{ marginBottom: '0.5rem' }}>Post not found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>{err}</p>
      <Link to="/feed" className="btn btn-outline">Back to feed</Link>
    </div>
  )

  const score = post.upvotes - post.downvotes
  const topComments = comments.filter(c => !c.parentId)
  const replies = comments.filter(c => c.parentId)

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '1rem 1.25rem' }}>
      <Link to="/feed" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
        ← Back to feed
      </Link>

      {/* Post */}
      <article className={`card ${post.isPinned ? 'pinned' : ''} ${post.isHighlighted ? 'highlighted' : ''}`} style={{ marginBottom: '1.25rem' }}>
        {(post.isPinned || post.isHighlighted) && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
            {post.isPinned && <span style={{ color: 'var(--gold-600)' }}>📌 Pinned</span>}
            {post.isHighlighted && <span style={{ color: 'var(--purple-500)' }}>★ Highlighted</span>}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Vote column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', minWidth: 40 }}>
            <button className={`vote-btn ${post.userVote === 'up' ? 'up-active' : ''}`} onClick={() => handleVote(post.id, 'post', 'up')} style={{ padding: '0.4rem', flexDirection: 'column' }}>▲</button>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: score > 0 ? 'var(--purple-600)' : score < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{score}</span>
            <button className={`vote-btn ${post.userVote === 'down' ? 'down-active' : ''}`} onClick={() => handleVote(post.id, 'post', 'down')} style={{ padding: '0.4rem', flexDirection: 'column' }}>▼</button>
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
              {post.isAnonymous ? (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>👤 anonymous</span>
              ) : (
                <Link to={`/profile/${post.authorId}`} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--purple-600)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {post.authorUsername} <RoleBadge role={post.authorRole} isVerified={post.authorIsVerified} />
                </Link>
              )}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{timeAgo(post.createdAt)}</span>
              {post.isNsfw && <span className="badge badge-red">NSFW</span>}
              {post.tags && post.tags.split(',').filter(Boolean).map(t => (
                <span key={t} className="badge badge-purple">{t.trim()}</span>
              ))}
            </div>

            <h1 style={{ margin: '0 0 0.875rem', fontSize: '1.35rem', lineHeight: 1.3 }}>{post.title}</h1>

            {post.postType === 'text' && post.content && (
              <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{post.content}</p>
            )}
            {post.postType === 'image' && post.imageUrl && (
              <div style={{ marginBottom: '1rem', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <img src={post.imageUrl} alt={post.title} style={{ maxWidth: '100%', borderRadius: 'var(--radius)' }} />
              </div>
            )}
            {post.postType === 'link' && post.linkUrl && (
              <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', background: 'var(--bg-accent)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                🔗 {post.linkUrl.replace(/^https?:\/\//, '')}
              </a>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>💬 {post.commentCount} comments</span>
              {user && (post.authorId === user.id || isMod) && (
                <button onClick={handleDeletePost} className="btn btn-danger btn-sm">🗑 Delete</button>
              )}
              {isMod && (
                <>
                  <button onClick={handlePin} className="btn btn-sm btn-outline" style={{ color: post.isPinned ? 'var(--gold-600)' : undefined }}>
                    📌 {post.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button onClick={handleHighlight} className="btn btn-sm btn-outline" style={{ color: post.isHighlighted ? 'var(--purple-500)' : undefined }}>
                    ★ {post.isHighlighted ? 'Remove highlight' : 'Highlight'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Comment form */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.875rem', fontSize: '0.95rem', fontWeight: 700 }}>
          {user ? 'Add a comment' : 'Sign in to comment'}
        </h3>
        {user ? (
          <form onSubmit={handleComment}>
            {replyTo && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                Replying to comment #{replyTo}
                <button type="button" onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.75rem' }}>Cancel</button>
              </div>
            )}
            <textarea className="input" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="What are your thoughts?" rows={3} style={{ marginBottom: '0.75rem' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 400, cursor: 'pointer', marginBottom: 0, color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={isAnon} onChange={e => setIsAnon(e.target.checked)} style={{ accentColor: 'var(--purple-600)' }} />
                👤 Post anonymously
              </label>
              <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !commentText.trim()}>
                {submitting ? 'Posting…' : '➤ Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-primary btn-sm">Sign in to comment</Link>
            <Link to="/signup" className="btn btn-outline btn-sm">Create account</Link>
          </div>
        )}
      </div>

      {/* Comments */}
      <div>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
        {topComments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No comments yet. Be the first!
          </div>
        ) : (
          topComments.map(c => (
            <CommentBlock
              key={c.id}
              comment={c}
              replies={replies.filter(r => r.parentId === c.id)}
              onVote={(cid, type) => handleVote(cid, 'comment', type)}
              onReply={setReplyTo}
              onDelete={handleDeleteComment}
              currentUserId={user?.id}
              isMod={isMod}
            />
          ))
        )}
      </div>
    </div>
  )
}
