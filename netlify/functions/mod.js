import { sql } from './db.js'
import { getSessionUser, json, error } from './auth-helper.js'

async function requireMod(event) {
  const user = await getSessionUser(event)
  if (!user) return [null, error('Not authenticated', 401)]
  if (user.role !== 'moderator' && user.role !== 'admin') return [null, error('Forbidden', 403)]
  return [user, null]
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return error('Method not allowed', 405)
  const action = event.path.replace(/^\/api\/mod\//, '')
  let body
  try { body = JSON.parse(event.body) } catch { return error('Invalid JSON') }

  if (action === 'pin') {
    const [, err] = await requireMod(event)
    if (err) return err
    await sql`UPDATE posts SET is_pinned = ${body.pinned} WHERE id = ${body.postId}`
    return json({ ok: true })
  }
  if (action === 'highlight') {
    const [, err] = await requireMod(event)
    if (err) return err
    await sql`UPDATE posts SET is_highlighted = ${body.highlighted} WHERE id = ${body.postId}`
    return json({ ok: true })
  }
  if (action === 'delete-comment') {
    const [, err] = await requireMod(event)
    if (err) return err
    await sql`DELETE FROM comments WHERE id = ${body.commentId}`
    return json({ ok: true })
  }
  if (action === 'ban') {
    const [, err] = await requireMod(event)
    if (err) return err
    await sql`UPDATE users SET is_banned = ${body.banned} WHERE id = ${body.userId}`
    return json({ ok: true })
  }
  if (action === 'promote') {
    const [user, err] = await requireMod(event)
    if (err) return err
    if (user.role !== 'admin') return error('Only admins can change roles', 403)
    const validRoles = ['member', 'verified', 'moderator', 'admin']
    if (!validRoles.includes(body.role)) return error('Invalid role')
    await sql`UPDATE users SET role = ${body.role}, is_verified = ${body.role === 'verified' || body.role === 'admin'} WHERE id = ${body.userId}`
    return json({ ok: true, role: body.role })
  }
  return error('Unknown action', 404)
}
