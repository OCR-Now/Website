import pg from 'pg'

const { Pool } = pg

let pool = null

export function getDb() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    })
  }
  return pool
}

export async function sql(strings, ...values) {
  const db = getDb()
  let text = ''
  const params = []
  strings.forEach((str, i) => {
    text += str
    if (i < values.length) {
      params.push(values[i])
      text += `$${params.length}`
    }
  })
  const result = await db.query(text, params)
  return result.rows
}

export const ADMIN_EMAIL = 'divinxxii@gmail.com'

export function getAdminRole(email) {
  if (email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return 'admin'
  return null
}
