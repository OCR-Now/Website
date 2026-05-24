import { sql } from './db.js'

export async function getSessionUser(event) {
  const cookieHeader = event.headers?.cookie || ''
  const match = cookieHeader.match(/session=([^;]+)/)
  if (!match) return null
  const sessionId = match[1]
  try {
    const rows = await sql`
      SELECT u.id, u.email, u.name, u.role, u.is_verified, u.is_banned, u.username, u.avatar_url
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ${sessionId} AND s.expires_at > NOW()
    `
    if (!rows.length) return null
    return rows[0]
  } catch { return null }
}

export function setCookie(sessionId) {
  return `session=${sessionId}; HttpOnly; SameSite=Strict; Max-Age=2592000; Path=/`
}

export function clearCookie() {
  return `session=; HttpOnly; SameSite=Strict; Max-Age=0; Path=/`
}

export function json(data, status = 200, headers = {}) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(data) }
}

export function error(message, status = 400) {
  return json({ error: message }, status)
}
