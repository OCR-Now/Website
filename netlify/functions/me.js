import { getSessionUser, json, error } from './auth-helper.js'

export const handler = async (event) => {
  const user = await getSessionUser(event)
  if (!user) return error('Not authenticated', 401)
  return json({ user })
}
