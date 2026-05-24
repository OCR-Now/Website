import { getDb } from './db.js'
import { getSessionUser, json, error } from './auth-helper.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return error('Method not allowed', 405)

  const user = await getSessionUser(event)
  if (!user) return error('Not authenticated', 401)

  let body
  try { body = JSON.parse(event.body) } catch { return error('Invalid JSON') }

  const { targetId, targetType, voteType } = body
  if (!targetId || !targetType || !voteType) return error('Missing fields')

  const sql = getDb()

  try {
    const existing = await sql`
      SELECT id, vote_type FROM votes
      WHERE user_id = ${user.id} AND target_id = ${targetId} AND target_type = ${targetType}
    `

    let finalVoteType = voteType

    if (existing.length) {
      if (existing[0].vote_type === voteType) {
        // Toggle off
        await sql`DELETE FROM votes WHERE id = ${existing[0].id}`
        finalVoteType = null

        if (targetType === 'post') {
          if (voteType === 'up') await sql`UPDATE posts SET upvotes = upvotes - 1 WHERE id = ${targetId}`
          else await sql`UPDATE posts SET downvotes = downvotes - 1 WHERE id = ${targetId}`
        } else {
          if (voteType === 'up') await sql`UPDATE comments SET upvotes = upvotes - 1 WHERE id = ${targetId}`
        }
      } else {
        // Change vote
        await sql`UPDATE votes SET vote_type = ${voteType} WHERE id = ${existing[0].id}`

        if (targetType === 'post') {
          if (voteType === 'up') await sql`UPDATE posts SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = ${targetId}`
          else await sql`UPDATE posts SET downvotes = downvotes + 1, upvotes = upvotes - 1 WHERE id = ${targetId}`
        } else {
          if (voteType === 'up') await sql`UPDATE comments SET upvotes = upvotes + 1 WHERE id = ${targetId}`
          else await sql`UPDATE comments SET upvotes = upvotes - 1 WHERE id = ${targetId}`
        }
      }
    } else {
      // New vote
      await sql`
        INSERT INTO votes (user_id, target_id, target_type, vote_type)
        VALUES (${user.id}, ${targetId}, ${targetType}, ${voteType})
      `
      if (targetType === 'post') {
        if (voteType === 'up') await sql`UPDATE posts SET upvotes = upvotes + 1 WHERE id = ${targetId}`
        else await sql`UPDATE posts SET downvotes = downvotes + 1 WHERE id = ${targetId}`
      } else {
        if (voteType === 'up') await sql`UPDATE comments SET upvotes = upvotes + 1 WHERE id = ${targetId}`
      }
    }

    return json({ voteType: finalVoteType })
  } catch (e) {
    console.error('Vote error:', e)
    return error('Failed to vote', 500)
  }
}
