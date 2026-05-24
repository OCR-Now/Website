import { sql, getAdminRole } from './db.js'
import { json, error, setCookie } from './auth-helper.js'
import { createHash } from 'crypto'

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':')
  const check = createHash('sha256').update(password + salt).digest('hex')
  return check === hash
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return error('Method not allowed', 405)

  let body
  try { body = JSON.parse(event.body) } catch { return error('Invalid JSON') }

  const { email, password } = body
  if (!email || !password) return error('Email and password are required')

  try {
    const users = await sql`
      SELECT id, email, name, password_hash, role, username, is_banned
      FROM users WHERE email = ${email.toLowerCase()}
    `
    if (!users.length) return error('Invalid email or password', 401)

    const user = users[0]
    if (!verifyPassword(password, user.password_hash)) return error('Invalid email or password', 401)
    if (user.is_banned) return error('This account has been suspended', 403)

    const adminRole = getAdminRole(email)
    if (adminRole && user.role !== 'admin') {
      await sql`UPDATE users SET role = 'admin' WHERE id = ${user.id}`
      user.role = 'admin'
    }

    const sessions = await sql`
      INSERT INTO sessions (user_id) VALUES (${user.id}) RETURNING id
    `
    const sessionId = sessions[0].id

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Set-Cookie': setCookie(sessionId) },
      body: JSON.stringify({ user: { id: user.id, email: user.email, name: user.name, role: user.role, username: user.username } })
    }
  } catch (e) {
    console.error('Login error:', e)
    return error('Login failed: ' + e.message, 500)
  }
}
