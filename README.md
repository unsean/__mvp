# AI Chat Profile App (Expo + Supabase + Node Backend)

This project is a production-ready mobile app built with **React Native (Expo)**, **Supabase** for backend data, and an optional **Node.js backend**. It features:
- Live profile, stats, badges, and activity integration with Supabase
- AI chat (DeepSeek API)
- Demo/mock data auto-insert for new users
- Ready for deployment to app stores and cloud backends

---

## 📱 Mobile App (Expo React Native)

### Setup
1. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn
   ```
2. **Copy and configure environment variables:**
   ```sh
   cp .env.example .env
   # Fill in your Supabase and API keys
   ```
3. **Start the Expo app:**
   ```sh
   npx expo start
   ```

### Build & Deploy
- [Expo build docs](https://docs.expo.dev/classic/building-standalone-apps/)
- Use `eas build` for App Store/Play Store deployment
- Configure `app.json` for your app name, icon, etc.

---

## 🗄️ Backend (Node.js/Express)

If you use the backend (`backend/server.js`):

### Setup
1. Go to backend folder:
   ```sh
   cd backend
   npm install
   ```
2. Create `.env` in backend with your secrets (see `.env.example` if present)
3. Start server locally:
   ```sh
   node server.js
   ```
4. Deploy to Railway, Render, Heroku, etc. for production

---

## 🗃️ Supabase
- Create a project at [supabase.com](https://supabase.com/)
- Run the provided SQL to create tables (`profiles`, `user_stats`, `user_badges`, `user_activities`, `ai_chats`)
- Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the project settings

---

## 🔑 Environment Variables
- `.env.example` provided for both client and backend
- **Never commit real secrets to git!**

---

## 🛠️ Customization
- All demo/mock data is auto-inserted for new users
- You can extend friends, chat, and activity features easily
- For production, review error handling and security (move secrets to env, etc)

---

## 📦 Project Structure
- `/screens` — App screens (Profile, Chat, Login, etc)
- `/components` — UI components
- `/contexts` — React contexts (e.g., Auth)
- `/services` — API and Supabase helpers
- `/backend` — (optional) Node.js/Express backend

---

## 🚀 Deploy Checklist
- [ ] Fill out `.env` and backend env vars
- [ ] Set up Supabase tables and keys
- [ ] Build Expo app for production
- [ ] Deploy backend (if used)
- [ ] Submit to App Store / Play Store

---

## 🙋 Need Help?
Open an issue or reach out for deployment help!
