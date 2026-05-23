import { getDb } from './db.js'
import { getSessionUser, json, error } from './auth-helper.js'

export const handler = async (event) => {
  const sql = getDb()
  const user = await getSessionUser(event)

  if (event.httpMethod === 'GET') {
    const params = new URLSearchParams(event.rawQuery || '')
    const tab = params.get('tab') || 'newest'
    const page = parseInt(params.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    try {
      let posts
      if (tab === 'trending') {
        posts = await sql`
          SELECT p.*, u.username as author_username, u.role as author_role, u.is_verified as author_is_verified,
            COALESCE(v.vote_type, null) as user_vote
          FROM posts p
          LEFT JOIN users u ON p.author_id = u.id
          LEFT JOIN votes v ON v.target_id = p.id AND v.target_type = 'post' AND v.user_id = ${user?.id || null}
          WHERE p.created_at > NOW() - INTERVAL '7 days'
          ORDER BY (p.upvotes - p.downvotes) DESC, p.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (tab === 'popular') {
        posts = await sql`
          SELECT p.*, u.username as author_username, u.role as author_role, u.is_verified as author_is_verified,
            COALESCE(v.vote_type, null) as user_vote
          FROM posts p
          LEFT JOIN users u ON p.author_id = u.id
          LEFT JOIN votes v ON v.target_id = p.id AND v.target_type = 'post' AND v.user_id = ${user?.id || null}
          ORDER BY (p.upvotes - p.downvotes) DESC, p.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (tab === 'media') {
        posts = await sql`
          SELECT p.*, u.username as author_username, u.role as author_role, u.is_verified as author_is_verified,
            COALESCE(v.vote_type, null) as user_vote
          FROM posts p
          LEFT JOIN users u ON p.author_id = u.id
          LEFT JOIN votes v ON v.target_id = p.id AND v.target_type = 'post' AND v.user_id = ${user?.id || null}
          WHERE p.post_type IN ('image', 'link')
          ORDER BY p.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        posts = await sql`
          SELECT p.*, u.username as author_username, u.role as author_role, u.is_verified as author_is_verified,
            COALESCE(v.vote_type, null) as user_vote
          FROM posts p
          LEFT JOIN users u ON p.author_id = u.id
          LEFT JOIN votes v ON v.target_id = p.id AND v.target_type = 'post' AND v.user_id = ${user?.id || null}
          ORDER BY p.is_pinned DESC, p.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      }

      return json(posts.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        postType: p.post_type,
        imageUrl: p.image_url,
        linkUrl: p.link_url,
        tags: p.tags,
        authorId: p.author_id,
        authorUsername: p.is_anonymous ? null : p.author_username,
        authorRole: p.author_role,
        authorIsVerified: p.author_is_verified,
        isAnonymous: p.is_anonymous,
        isNsfw: p.is_nsfw,
        isPinned: p.is_pinned,
        isHighlighted: p.is_highlighted,
        upvotes: p.upvotes,
        downvotes: p.downvotes,
        commentCount: p.comment_count,
        userVote: p.user_vote,
        createdAt: p.created_at
      })))
    } catch (e) {
      console.error('Posts fetch error:', e)
      return error('Failed to fetch posts', 500)
    }
  }

  if (event.httpMethod === 'POST') {
    if (!user) return error('Not authenticated', 401)

    let body
    try { body = JSON.parse(event.body) } catch { return error('Invalid JSON') }

    const { title, content, postType = 'text', imageUrl, linkUrl, tags, isNsfw = false, isAnonymous = false } = body
    if (!title?.trim()) return error('Title is required')

    try {
      const posts = await sql`
        INSERT INTO posts (title, content, post_type, image_url, link_url, tags, author_id, is_anonymous, is_nsfw)
        VALUES (${title.trim()}, ${content?.trim() || null}, ${postType}, ${imageUrl?.trim() || null},
                ${linkUrl?.trim() || null}, ${tags?.trim() || null}, ${user.id}, ${isAnonymous}, ${isNsfw})
        RETURNING id
      `
      return json({ id: posts[0].id })
    } catch (e) {
      console.error('Post create error:', e)
      return error('Failed to create post', 500)
    }
  }

  return error('Method not allowed', 405)
}
