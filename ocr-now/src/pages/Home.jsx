import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export default function Home() {
  const { user } = useAuth()

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'var(--purple-900)',
        padding: '5rem 1.25rem 4rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative academic pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(212,160,23,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,160,23,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--gold-500), var(--purple-400), var(--gold-500))' }} />

        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.3)', borderRadius: 999, padding: '0.3rem 0.875rem', fontSize: '0.8rem', color: 'var(--gold-300)', fontWeight: 600, letterSpacing: '0.04em' }}>
              📚 Cambridge National Student Community
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 'clamp(2.5rem, 7vw, 4rem)', color: 'var(--gold-400)', lineHeight: 1 }}>OCR</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 'clamp(2.5rem, 7vw, 4rem)', color: 'var(--cream)', lineHeight: 1 }}>now</span>
          </div>

          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'rgba(250,248,244,0.75)', maxWidth: 520, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            A community built for Cambridge National students. Share notes, ask questions, discuss exams — anonymously if you want.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <>
                <Link to="/feed" className="btn btn-gold" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>Browse feed →</Link>
                <Link to="/create" className="btn btn-ghost" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>Create a post</Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="btn btn-gold" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>Join the community →</Link>
                <Link to="/feed" className="btn btn-ghost" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>Browse anonymously</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '4rem 1.25rem', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '0.75rem', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            Built for students, by students
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: 480, margin: '0 auto 3rem' }}>
            A proper forum for Cambridge National questions, revision help, and exam discussion.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '👤', title: 'Anonymous posting', desc: 'Post without your name attached. Your identity stays private — even from us.' },
              { icon: '💬', title: 'Threaded discussion', desc: 'Nested comments, upvoting, and sorting. Real conversations, not hot takes.' },
              { icon: '📌', title: 'Moderated space', desc: 'Active moderators keep things civil. Freedom with responsibility.' },
              { icon: '🏷', title: 'Tagged topics', desc: 'Tag posts by subject — R081, R082, IT, Science, Business and more.' },
              { icon: '⭐', title: 'Community voting', desc: 'Upvote good answers, downvote bad ones. The best content rises.' },
              { icon: '🔒', title: 'Privacy first', desc: 'Minimal data. No tracking. No data sales. Your activity is yours.' }
            ].map(f => (
              <div key={f.title} className="card card-hover" style={{ transition: 'all 0.15s' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ margin: '0 0 0.4rem', fontSize: '1rem', fontWeight: 700 }}>{f.title}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '4rem 1.25rem', borderTop: '1px solid var(--border-light)', background: 'var(--purple-50)', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h2 style={{ marginBottom: '0.75rem', fontSize: 'clamp(1.5rem, 4vw, 1.85rem)' }}>Ready to join?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Whether you're revising, stuck on coursework, or just want to chat about exams — you're welcome here.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>Create free account</Link>
            <Link to="/feed" className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>Browse feed</Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-light)', padding: '1.25rem', textAlign: 'center', background: 'var(--purple-900)', color: 'rgba(250,248,244,0.5)', fontSize: '0.8rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ background: 'var(--gold-500)', color: 'var(--purple-900)', fontFamily: 'var(--font-serif)', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: 3, fontSize: '0.8rem' }}>OCR</span>
            <span style={{ color: 'rgba(250,248,244,0.7)', fontFamily: 'var(--font-serif)' }}>now</span>
            <span>— Cambridge National Community</span>
          </div>
          <div>🔒 No tracking · ✓ Anonymous posting · 📚 Students only</div>
        </div>
      </footer>
    </div>
  )
}
