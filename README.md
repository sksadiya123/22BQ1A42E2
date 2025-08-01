# 🔗 URL Shortener with Logging Middleware

**Author:** Sadiya Shaik (22BQ1A42E2)

A full stack React + Node.js app that lets users shorten URLs and view analytics, with a custom logging middleware integrated across the app.

## 🚀 Features
- Shorten up to 5 URLs at once
- Custom or auto-generated shortcodes
- Optional validity (defaults to 30 mins)
- View click statistics and source info
- Logs all key events via reusable `log()` function

## 🛠️ Tech Stack
- Frontend: React.js + Material UI
- Backend: Node.js + Express

## 📄 Logging Example
```js
log("frontend", "info", "component", "URL submitted");
log("backend", "error", "handler", "invalid URL format");

📥 Setup
bash
Copy
Edit
git clone <repo-url>
cd client && npm install
cd ../server && npm install
