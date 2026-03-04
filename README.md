# Battlememe

Battlememe is a simple meme arena app: users register/login, upload memes for moderation, admins approve/reject, and the public feed shows approved memes with votes + comments.

## Live Demo
- Site: https://meme-arena.netlify.app
- Repository: https://github.com/LichenMoontree/meme-arena

## Features
- Authentication (Supabase Auth): Register, Login, Logout
- Upload meme (image + title) → goes to admin approval
- Admin queue: approve / reject pending memes
- Home feed: approved memes + vote score + comment count
- Meme details page: vote + comment
- My Memes: view your uploads and status

## Tech Stack
- Vite + Vanilla JS
- Bootstrap
- Supabase (Auth, Postgres, Storage)
- Netlify (deployment)

## Setup (Local)
1) Install dependencies:
```bash
npm install