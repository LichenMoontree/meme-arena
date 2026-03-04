# Battlememe — Project Documentation

## Live Demo
- Site: https://meme-arena.netlify.app
- Repository: https://github.com/LichenMoontree/meme-arena

---

## 1) Project Description

Battlememe is a meme-sharing “arena” web app. Users can register/login, upload memes for moderation, and approved memes appear in the public feed. Users can vote and comment on memes. Admin users can approve or reject uploaded memes.

### What the app does
- Register / Login / Logout (Supabase Auth)
- Upload a meme (image + title)
- Admin moderation (approve / reject)
- Home feed displays approved memes
- Meme details page supports voting and commenting
- “My Memes” page shows the current user’s uploads and their statuses

### Roles and permissions

**Guest (not logged in):**
- Can view the Home feed (approved memes)
- Can open meme details
- Can see vote score and comment count
- Can access Login and Register

**User (logged in):**
- Everything a guest can do
- Can upload memes
- Can vote and comment
- Can view “My Memes” (their uploads + status)

**Admin:**
- Everything a logged-in user can do
- Can access “Admin Queue”
- Can approve or reject incoming memes

---

## 2) Architecture

### Front-end
- Built with Vite + Vanilla JavaScript (ES Modules)
- Uses Bootstrap for layout and components
- Uses a custom CSS theme (black navbar, neon buttons, card styling)
- Each page is a separate folder with its own `index.html` + `page.js`

### Back-end
Supabase is used as the backend:
- Supabase Auth: user registration/login/logout
- Supabase Postgres: stores memes, votes, comments, user roles
- Supabase Storage: stores uploaded meme images in a bucket named `memes`
- Row Level Security (RLS) and policies control access to data

### Deployment
- Deployed on Netlify
- Supabase provides the hosted database and storage

---

## 3) Technologies Used
- Vite
- JavaScript (ES Modules)
- Bootstrap
- Supabase (Auth, Postgres, Storage)
- Netlify

---

## 4) Database Schema Design

### Main entities
- **memes**: stores uploaded memes (title, image path, status, owner, timestamps)
- **votes**: stores user votes per meme (+1 / -1)
- **comments**: stores user comments per meme
- **user_roles**: stores role mapping (admin/user) by user_id
- **meme_stats (view)**: aggregated score and comment count per meme for the feed UI

### Relationships overview
- One user can upload many memes
- One meme can have many votes
- One meme can have many comments
- One user can write many comments
- A user can have a role record (admin/user)

### ERD-style textual diagram
```text
auth.users (Supabase)
→ one-to-many → memes

memes
→ one-to-many → votes
memes
→ one-to-many → comments

auth.users
→ one-to-one → user_roles

meme_stats is a database view that summarizes votes and comments for each meme.
```

---

## 5) Local Development Setup Guide

### Prerequisites
- Node.js installed
- npm installed
- A Supabase project created and configured

### Steps
1) Open the project folder in VS Code
2) Install dependencies:
   - npm install
3) Run the development server:
   - npm run dev
4) Open the local URL printed by Vite (commonly http://localhost:5173/)

### Environment variables
The project uses a local `.env` file (not committed to GitHub) containing:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

---

## 6) Supabase Setup Overview
1) Create a Supabase project
2) Create a Storage bucket named: `memes`
3) Create database tables and security policies (RLS) for:
   - memes
   - votes
   - comments
   - user_roles
4) Create the meme_stats view (aggregated score and comment count)
5) Assign admin rights by inserting/updating a row in user_roles for the selected user_id

---

## 7) Key Folders and Files (Purpose)

### src/pages/
Contains the website pages. Each page has its own `index.html` and `page.js`.
- src/pages/home/ — Home feed (approved memes + stats)
- src/pages/login/ — Login page and logic
- src/pages/register/ — Register page and logic
- src/pages/upload/ — Upload form (image + title)
- src/pages/my-memes/ — User’s uploads and statuses
- src/pages/admin/ — Admin queue (approve/reject)
- src/pages/meme/ — Meme details (vote + comments)

### src/services/
Shared logic:
- supabaseClient.js — creates the Supabase client using env variables
- nav.js — dynamic navigation (logged in/out, admin)

### src/styles/
- theme.css — global styling (navbar, buttons, cards)

### public/assets/
- static assets (hero images, icons)

### package.json
Scripts and dependencies (for example):
- npm run dev
- npm run build

---

## 8) Data Cleanup Note (Optional)
If deleting a meme manually via Supabase dashboard:
- Delete the row from the memes table
- Delete the corresponding image file from Storage bucket `memes` using the image_path value