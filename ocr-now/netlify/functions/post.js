import { getDb } from './db.js'
import { getSessionUser, json, error } from './auth-helper.js'

export const handler = async (event) => {
  const sql = getDb()
  const user = await getSessionUser(event)
  const parts = event.path.replace(/^\/api\/post\//, '').split('/')
  const postId = parts[0]
  const sub = parts[1]

  if (!postId || isNaN(parseInt(postId))) return error('Invalid post ID', 400)

  // GET /api/post/:id
  if (event.httpMethod === 'GET' && !sub) {
    try {
      const posts = await sql`
        SELECT p.*, u.username as author_username, u.role as author_role, u.is_verified as author_is_verified,
          COALESCE(v.vote_type, null) as user_vote
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN votes v ON v.target_id = p.id AND v.target_type = 'post' AND v.user_id = ${user?.id || null}
        WHERE p.id = ${postId}
      `
      if (!posts.length) return error('Post not found', 404)
      const p = posts[0]

      const comments = await sql`
        SELECT c.*, u.username as author_username, u.role as author_role, u.is_verified as author_is_verified,
          COALESCE(v.vote_type, null) as user_vote
        FROM comments c
        LEFT JOIN users u ON c.author_id = u.id
        LEFT JOIN votes v ON v.target_id = c.id AND v.target_type = 'comment' AND v.user_id = ${user?.id || null}
        WHERE c.post_id = ${postId}
        ORDER BY c.created_at DESC
      `

      return json({
        post: {
          id: p.id, title: p.title, content: p.content, postType: p.post_type,
          imageUrl: p.image_url, linkUrl: p.link_url, tags: p.tags,
          authorId: p.author_id, authorUsername: p.is_anonymous ? null : p.author_username,
          authorRole: p.author_role, authorIsVerified: p.author_is_verified,
          isAnonymous: p.is_anonymous, isNsfw: p.is_nsfw, isPinned: p.is_pinned,
          isHighlighted: p.is_highlighted, upvotes: p.upvotes, downvotes: p.downvotes,
          commentCount: p.comment_count, userVote: p.user_vote, createdAt: p.created_at
        },
        comments: comments.map(c => ({
          id: c.id, postId: c.post_id, content: c.content, parentId: c.parent_id,
          authorId: c.author_id, authorUsername: c.is_anonymous ? null : c.author_username,
          authorRole: c.author_role, authorIsVerified: c.author_is_verified,
          isAnonymous: c.is_anonymous, upvotes: c.upvotes, userVote: c.user_vote,
          createdAt: c.created_at
        }))
      })
    } catch (e) {
      console.error('Post fetch error:', e)
      return error('Failed to fetch post', 500)
    }
  }

  // DELETE /api/post/:id
  if (event.httpMethod === 'DELETE' && !sub) {
    if (!user) return error('Not authenticated', 401)
    try {
      const posts = await sql`SELECT author_id FROM posts WHERE id = ${postId}`
      if (!posts.length) return error('Post not found', 404)
      const isMod = user.role === 'moderator' || user.role === 'admin'
      if (posts[0].author_id !== user.id && !isMod) return error('Forbidden', 403)
      await sql`DELETE FROM posts WHERE id = ${postId}`
      return json({ ok: true })
    } catch (e) {
      return error('Failed to delete post', 500)
    }
  }

  // POST /api/post/:id/comments
  if (event.httpMethod === 'POST' && sub === 'comments') {
    if (!user) return error('Not authenticated', 401)
    let body
    try { body = JSON.parse(event.body) } catch { return error('Invalid JSON') }
    const { content, parentId, isAnonymous = false } = body
    if (!content?.trim()) return error('Content is required')

    try {
      const comments = await sql`
        INSERT INTO comments (post_id, author_id, content, parent_id, is_anonymous)
        VALUES (${postId}, ${user.id}, ${content.trim()}, ${parentId || null}, ${isAnonymous})
        RETURNING id, post_id, content, parent_id, is_anonymous, created_at
      `
      await sql`UPDATE posts SET comment_count = comment_count + 1 WHERE id = ${postId}`

      return json({
        ...comments[0],
        authorUsername: isAnonymous ? null : user.username,
        authorRole: user.role,
        authorIsVerified: user.is_verified,
        upvotes: 0,
        userVote: null
      })
    } catch (e) {
      console.error('Comment create error:', e)
      return error('Failed to post comment', 500)
    }
  }

  return error('Not found', 404)
}
