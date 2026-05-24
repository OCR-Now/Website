import { getDb } from './db.js'
import { getSessionUser, json, error } from './auth-helper.js'

async function requireMod(event) {
  const user = await getSessionUser(event)
  if (!user) return [null, error('Not authenticated', 401)]
  if (user.role !== 'moderator' && user.role !== 'admin') return [null, error('Forbidden', 403)]
  return [user, null]
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return error('Method not allowed', 405)

  const sql = getDb()
  const action = event.path.replace(/^\/api\/mod\//, '')

  let body
  try { body = JSON.parse(event.body) } catch { return error('Invalid JSON') }

  if (action === 'pin') {
    const [, err] = await requireMod(event)
    if (err) return err
    const { postId, pinned } = body
    await sql`UPDATE posts SET is_pinned = ${pinned} WHERE id = ${postId}`
    return json({ ok: true })
  }

  if (action === 'highlight') {
    const [, err] = await requireMod(event)
    if (err) return err
    const { postId, highlighted } = body
    await sql`UPDATE posts SET is_highlighted = ${highlighted} WHERE id = ${postId}`
    return json({ ok: true })
  }

  if (action === 'delete-comment') {
    const [, err] = await requireMod(event)
    if (err) return err
    const { commentId } = body
    await sql`DELETE FROM comments WHERE id = ${commentId}`
    return json({ ok: true })
  }

  if (action === 'ban') {
    const [, err] = await requireMod(event)
    if (err) return err
    const { userId, banned } = body
    await sql`UPDATE users SET is_banned = ${banned} WHERE id = ${userId}`
    return json({ ok: true })
  }

  if (action === 'promote') {
    const [user, err] = await requireMod(event)
    if (err) return err
    if (user.role !== 'admin') return error('Only admins can change roles', 403)
    const { userId, role } = body
    const validRoles = ['member', 'verified', 'moderator', 'admin']
    if (!validRoles.includes(role)) return error('Invalid role')
    await sql`UPDATE users SET role = ${role}, is_verified = ${role === 'verified' || role === 'admin'} WHERE id = ${userId}`
    return json({ ok: true, role })
  }

  return error('Unknown action', 404)
}
