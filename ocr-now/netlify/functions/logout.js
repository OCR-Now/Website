import { getDb } from './db.js'
import { getSessionUser, clearCookie, json, error } from './auth-helper.js'

export const handler = async (event) => {
  const cookieHeader = event.headers?.cookie || ''
  const match = cookieHeader.match(/session=([^;]+)/)
  const sql = getDb()

  if (match) {
    try { await sql`DELETE FROM sessions WHERE id = ${match[1]}` } catch {}
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearCookie() },
    body: JSON.stringify({ ok: true })
  }
}
