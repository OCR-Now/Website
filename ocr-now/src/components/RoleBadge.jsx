export default function RoleBadge({ role, isVerified }) {
  if (role === 'admin') return (
    <span className="badge badge-gold" title="Admin">★ Admin</span>
  )
  if (role === 'moderator') return (
    <span className="badge badge-purple" title="Moderator">⚖ Mod</span>
  )
  if (isVerified || role === 'verified') return (
    <span className="badge badge-purple" title="Verified">✓</span>
  )
  return null
}
