import { getDb, getAdminRole } from './db.js'
import { json, error, setCookie } from './auth-helper.js'
import { createHash, randomBytes } from 'crypto'

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = createHash('sha256').update(password + salt).digest('hex')
  return `${salt}:${hash}`
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return error('Method not allowed', 405)

  let body
  try { body = JSON.parse(event.body) } catch { return error('Invalid JSON') }

  const { email, password, name } = body
  if (!email || !password || !name) return error('Email, password and name are required')
  if (password.length < 8) return error('Password must be at least 8 characters')

  const sql = getDb()

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`
    if (existing.length) return error('An account with this email already exists', 409)

    const passwordHash = hashPassword(password)
    const adminRole = getAdminRole(email)
    const role = adminRole || 'member'
    const username = email.split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase().slice(0, 30)

    const users = await sql`
      INSERT INTO users (email, name, password_hash, role, username)
      VALUES (${email.toLowerCase()}, ${name}, ${passwordHash}, ${role}, ${username})
      RETURNING id, email, name, role, username
    `
    const user = users[0]

    const sessions = await sql`
      INSERT INTO sessions (user_id) VALUES (${user.id}) RETURNING id
    `
    const sessionId = sessions[0].id

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': setCookie(sessionId)
      },
      body: JSON.stringify({ user: { id: user.id, email: user.email, name: user.name, role: user.role, username: user.username } })
    }
  } catch (e) {
    console.error('Signup error:', e)
    return error('Failed to create account', 500)
  }
}
