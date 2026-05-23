import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export default function Create() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState('text')
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [tags, setTags] = useState('')
  const [isNsfw, setIsNsfw] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  if (!ready) return <div style={{ minHeight: '100vh' }} />

  if (!user) return (
    <div style={{ maxWidth: 560, margin: '5rem auto', padding: '0 1.25rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
      <h2 style={{ marginBottom: '0.5rem' }}>Sign in to post</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        You need an account to create posts. You can still post anonymously after signing in.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <Link to="/login" className="btn btn-primary">Sign in</Link>
        <Link to="/signup" className="btn btn-outline">Create account</Link>
      </div>
    </div>
  )

  const handleSubmit = async e => {
    e.preventDefault()
    if (!title.trim()) { setErr('Title is required'); return }
    setLoading(true)
    setErr('')
    try {
      const r = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), postType, imageUrl: imageUrl.trim(), linkUrl: linkUrl.trim(), tags: tags.trim(), isNsfw, isAnonymous })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Failed to create post')
      navigate(`/post/${data.id}`)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  const types = [
    { id: 'text', label: '📝 Text', desc: 'Write something' },
    { id: 'image', label: '🖼 Image', desc: 'Share an image' },
    { id: 'link', label: '🔗 Link', desc: 'Share a link' }
  ]

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.35rem' }}>Create post</h1>
        <Link to="/feed" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>✕ Cancel</Link>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Post type */}
        <div className="card" style={{ padding: '0.875rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {types.map(t => (
              <button key={t.id} type="button" onClick={() => setPostType(t.id)} style={{
                flex: 1, padding: '0.5rem', borderRadius: 'var(--radius)', border: postType === t.id ? '1.5px solid var(--purple-400)' : '1.5px solid var(--border)',
                background: postType === t.id ? 'var(--accent-light)' : 'var(--bg-primary)', color: postType === t.id ? 'var(--purple-700)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-sans)', transition: 'all 0.15s'
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {err && <div className="alert alert-error">{err}</div>}

          <div>
            <label>Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="input" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="What's this about?" maxLength={300} required />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>{title.length}/300</div>
          </div>

          {postType === 'text' && (
            <div>
              <label>Content</label>
              <textarea className="input" value={content} onChange={e => setContent(e.target.value)} placeholder="Share your thoughts, question, or revision tip…" rows={6} />
            </div>
          )}

          {postType === 'image' && (
            <>
              <div>
                <label>Image URL</label>
                <input className="input" type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                {imageUrl && (
                  <div style={{ marginTop: '0.5rem', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                    <img src={imageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 280, objectFit: 'contain', display: 'block' }} onError={e => e.currentTarget.style.display = 'none'} />
                  </div>
                )}
              </div>
              <div>
                <label>Caption (optional)</label>
                <input className="input" type="text" value={content} onChange={e => setContent(e.target.value)} placeholder="Add a caption…" />
              </div>
            </>
          )}

          {postType === 'link' && (
            <>
              <div>
                <label>URL</label>
                <input className="input" type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://example.com" />
              </div>
              <div>
                <label>Description (optional)</label>
                <textarea className="input" value={content} onChange={e => setContent(e.target.value)} placeholder="What's this link about?" rows={3} />
              </div>
            </>
          )}

          <div>
            <label>Tags <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(comma separated)</span></label>
            <input className="input" type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="R081, revision, help, IT" />
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 400, marginBottom: 0 }}>
              <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} style={{ accentColor: 'var(--purple-600)' }} />
              👤 Post anonymously
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 400, marginBottom: 0 }}>
              <input type="checkbox" checked={isNsfw} onChange={e => setIsNsfw(e.target.checked)} style={{ accentColor: 'var(--danger)' }} />
              ⚠️ Mark as NSFW
            </label>
          </div>

          {isAnonymous && (
            <div className="alert alert-info" style={{ fontSize: '0.8rem' }}>
              👤 Your username will be hidden. The post will appear as posted by "anonymous".
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading || !title.trim()} style={{ padding: '0.75rem', fontSize: '0.95rem', justifyContent: 'center' }}>
          {loading ? 'Posting…' : '➤ Post'}
        </button>
      </form>
    </div>
  )
}
