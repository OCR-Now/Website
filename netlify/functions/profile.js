import { sql } from './db.js'
import { getSessionUser, json, error } from './auth-helper.js'

export const handler = async (event) => {
  const userId = event.path.replace(/^\/api\/profile\//, '').split('/')[0]

  if (event.httpMethod === 'GET') {
    try {
      const users = await sql`
        SELECT u.*, (SELECT COUNT(*) FROM posts WHERE author_id = u.id AND NOT is_anonymous) as post_count
        FROM users u WHERE u.id = ${userId}`
      if (!users.length) return error('User not found', 404)
      const u = users[0]
      return json({
        id: u.id, email: u.email, name: u.name, username: u.username,
        displayName: u.name, role: u.role, isVerified: u.is_verified,
        isBanned: u.is_banned, avatarUrl: u.avatar_url, bio: u.bio,
        createdAt: u.created_at, postCount: parseInt(u.post_count),
        followerCount: 0, followingCount: 0
      })
    } catch (e) { return error('Failed to fetch profile: ' + e.message, 500) }
  }

  if (event.httpMethod === 'PATCH') {
    const user = await getSessionUser(event)
    if (!user) return error('Not authenticated', 401)
    if (user.id !== userId) return error('Forbidden', 403)
    let body
    try { body = JSON.parse(event.body) } catch { return error('Invalid JSON') }
    const { displayName, username, bio, avatarUrl } = body
    if (!displayName?.trim()) return error('Display name is required')
    const cleanUsername = username?.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30)
    try {
      const existing = await sql`SELECT id FROM users WHERE username = ${cleanUsername} AND id != ${userId}`
      if (existing.length) return error('Username already taken', 409)
      await sql`UPDATE users SET name = ${displayName.trim()}, username = ${cleanUsername}, bio = ${bio?.trim() || null}, avatar_url = ${avatarUrl?.trim() || null} WHERE id = ${userId}`
      return json({ ok: true })
    } catch (e) { return error('Failed to update profile: ' + e.message, 500) }
  }

  return error('Method not allowed', 405)
}
