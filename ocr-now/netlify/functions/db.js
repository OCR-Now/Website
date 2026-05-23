import { neon } from '@neondatabase/serverless'

export function getDb() {
  const sql = neon(process.env.DATABASE_URL)
  return sql
}

// Auto-promote admin email on login/signup
export const ADMIN_EMAIL = 'divinxxii@gmail.com'

export function getAdminRole(email) {
  if (email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return 'admin'
  return null
}
