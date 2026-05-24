# OCR-now — Cambridge National Student Community

A forum built for Cambridge National students. Dark academic purple/gold theme, anonymous posting, voting, comments, and full moderation.

---

## Setup Guide (Netlify + Neon DB)

### 1. Push to GitHub

Create a new GitHub repo and push this folder to it.

### 2. Connect to Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Choose your GitHub repo
3. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click **Deploy site**

### 3. Add a Database (Netlify DB / Neon)

1. In your Netlify dashboard → your site → **DB** tab
2. Click **Create database**
3. Once created, Netlify automatically adds `DATABASE_URL` to your environment variables

### 4. Run the Database Schema

1. In Netlify dashboard → **DB** → **Query editor**
2. Copy and paste the entire contents of `schema.sql`
3. Click **Run**

This creates all the tables: users, posts, comments, votes, sessions.

### 5. Install Function Dependencies

Netlify auto-installs function dependencies from `netlify/functions/package.json`. No extra steps needed.

### 6. Redeploy

After adding the DB, trigger a new deploy:
- Netlify dashboard → **Deploys** → **Trigger deploy** → **Deploy site**

---

## Admin Account

The email **divinxxii@gmail.com** is hardcoded as admin. Every time this account logs in, it is automatically promoted to `admin` role — it can never be accidentally downgraded.

To use it:
1. Sign up at `/signup` with that email
2. You'll immediately have admin privileges

Admin can: pin/unpin posts, highlight posts, ban/unban users, promote users to any role (member, verified, moderator, admin), delete any post or comment.

---

## Features

- 📝 Text, image, and link posts
- 💬 Threaded comments with nested replies
- 👍 Upvote/downvote posts and comments
- 👤 Anonymous posting (identity completely hidden)
- 🏷 Tagging system
- ⚠️ NSFW flagging
- 📌 Pin and highlight posts (mod/admin)
- 🚫 Ban users (mod/admin)
- ⭐ Role system: member → verified → moderator → admin
- 🔒 Session-based auth (no third-party identity providers needed)
- 📱 Responsive layout

---

## Local Development

```bash
npm install
# Install Netlify CLI if you haven't
npm install -g netlify-cli
# Link to your Netlify site (pulls env vars including DATABASE_URL)
netlify link
# Run locally
netlify dev
```

The app runs at `http://localhost:8888`

---

## Project Structure

```
ocr-now/
├── netlify/
│   └── functions/          # Backend API (Netlify Functions)
│       ├── db.js            # DB connection + admin email config
│       ├── auth-helper.js   # Session utilities
│       ├── login.js         # POST /api/login
│       ├── signup.js        # POST /api/signup
│       ├── logout.js        # POST /api/logout
│       ├── me.js            # GET /api/me
│       ├── posts.js         # GET/POST /api/posts
│       ├── post.js          # GET/DELETE /api/post/:id + comments
│       ├── vote.js          # POST /api/vote
│       ├── profile.js       # GET/PATCH /api/profile/:id
│       └── mod.js           # POST /api/mod/* (pin/highlight/ban/promote)
├── src/
│   ├── components/
│   │   ├── Nav.jsx
│   │   ├── PostCard.jsx
│   │   └── RoleBadge.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Feed.jsx
│   │   ├── Auth.jsx         # Login + Signup
│   │   ├── Create.jsx
│   │   ├── PostDetail.jsx
│   │   ├── Profile.jsx
│   │   └── Settings.jsx
│   ├── lib/
│   │   ├── auth.jsx         # Auth context
│   │   └── time.js          # Date formatting
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── schema.sql               # Run this in Netlify DB to create tables
├── netlify.toml
└── package.json
```
