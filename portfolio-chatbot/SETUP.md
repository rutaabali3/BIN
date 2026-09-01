# Portfolio chatbot — exact steps

This adds an **Ask Rutaab** widget to [rutaabali3-portfolio.vercel.app](https://rutaabali3-portfolio.vercel.app/). Visitors ask about you; Groq answers **only** from the portfolio knowledge file. The Groq key never goes in frontend JavaScript.

Your site is static HTML on Vercel. A **100% browser-only** Groq call would leak the key in DevTools, even if the GitHub repo is private. The live JS is public. So the key lives on the server:

```
Visitor  →  chatbot.js (no key)  →  POST /api/chat  →  Groq
                                      ↑
                         GROQ_API_KEY (Vercel env)
```

GitHub Secrets hide the key from the **repo**. Vercel Environment Variables hide it at **runtime**. You need both if you want the secret in GitHub *and* a working production bot.

---

## 0. Files to copy into the private repo (project root)

| Copy from this folder | Into your repo |
|---|---|
| `api/chat.js` | `api/chat.js` |
| `lib/portfolio-knowledge.js` | `lib/portfolio-knowledge.js` |
| `js/chatbot.js` | `js/chatbot.js` |
| `css/chatbot.css` | `css/chatbot.css` |
| `vercel.json` | `vercel.json` (merge if you already have one) |
| `.env.example` | `.env.example` |

Add `.env` to `.gitignore` (see `gitignore-snippet.txt`). Never commit a real key.

---

## 1. Create a Groq API key

1. Open [https://console.groq.com](https://console.groq.com) and sign in.
2. Go to **API Keys** → **Create API Key**.
3. Copy the key (`gsk_...`). Store it in a password manager. You will not see it again.

Llama 3.3 / 3.1 chat models were shut down on Groq (16 Aug 2026). This bot defaults to `openai/gpt-oss-20b`. Override later with `GROQ_MODEL` if you want.

---

## 2. Save the secret on GitHub (private repo)

This does **not** by itself make the live site work. It only keeps the key out of git history and available to GitHub Actions.

1. GitHub → your **private** portfolio repo.
2. **Settings** → **Secrets and variables** → **Actions**.
3. **New repository secret**.
4. Name: `GROQ_API_KEY` (exact).
5. Value: the `gsk_...` key.
6. Save.

Do **not** put the key in:

- `js/chatbot.js` or any HTML
- a committed `.env`
- a variable named `NEXT_PUBLIC_*` or `VITE_*` (those are exposed to the browser)

---

## 3. Save the same secret on Vercel (required for the live bot)

Vercel is what actually runs `/api/chat`. GitHub Secrets are **not** injected into Vercel automatically.

1. [Vercel Dashboard](https://vercel.com/dashboard) → this project.
2. **Settings** → **Environment Variables**.
3. Key: `GROQ_API_KEY`
4. Value: the same `gsk_...` key.
5. Environments: **Production**, **Preview**, and **Development**.
6. Save.
7. **Redeploy** the latest deployment (or push a commit). Env vars apply on the next build/deploy, not to an already-running old deployment.

Optional extra variable:

- `GROQ_MODEL` = `openai/gpt-oss-20b` (or another current Groq chat model)

If the GitHub repo is private, keep the Vercel Git integration connected as you already do. Vercel can build private repos when the GitHub app has access.

---

## 4. Load the widget on every page

**Recommended:** one change in `js/footer.js`, because every page already loads the footer.

Inside the existing IIFE, after `hrefFor` exists, add the block from `footer-patch.js`:

```js
if (!document.querySelector("script[data-portfolio-chatbot]")) {
  var chat = document.createElement("script");
  chat.src = hrefFor("js/chatbot.js");
  chat.defer = true;
  chat.setAttribute("data-portfolio-chatbot", "");
  document.body.appendChild(chat);
}
```

`chatbot.js` injects its own CSS and the floating button. Bootstrap Icons are already on the site.

**Alternative:** add this before `</body>` on each HTML file (use `../js/chatbot.js` on blog subpages):

```html
<script src="./js/chatbot.js" defer></script>
```

---

## 5. Ground the answers in the portfolio

`lib/portfolio-knowledge.js` is the only source the model is allowed to use. `api/chat.js` ships it as the system prompt and tells Groq:

- answer only from that text
- refuse anything else (age, phone, salary, random trivia, coding homework, …)
- point people to [contact.html](https://rutaabali3-portfolio.vercel.app/contact.html) / `rutaabali3@gmail.com`

When you add a project, job, or skill on the site, **update this file in the same commit**. Otherwise the bot will not know it.

---

## 6. Commit, push, confirm

```bash
git add api/chat.js lib/portfolio-knowledge.js js/chatbot.js css/chatbot.css vercel.json js/footer.js .env.example
git commit -m "Add portfolio-only Groq chatbot"
git push
```

Vercel deploys from the private repo as usual.

Checks after deploy:

1. Purple chat button, bottom-right, on Home / About / Projects / etc.
2. Ask: **What skills does he have?** → list from the tech grid.
3. Ask: **What is his phone number?** → refusal + contact link.
4. Browser DevTools → Network → `/api/chat` request has **no** `gsk_` key.
5. View source of `chatbot.js` — no API key.

---

## 7. Local test (optional)

```bash
npm i -g vercel
vercel env pull .env.local    # needs Vercel login
vercel dev
```

Open `http://localhost:3000`. Chat calls `/api/chat` on the local serverless function.

---

## 8. Update privacy copy

Paste `privacy-snippet.html` onto `privacy.html`. The widget sends messages to Vercel, then Groq. That is different from the contact form (browser-only Gmail draft).

---

## Why GitHub Secrets alone are not enough

| Place | What it protects | Used by the live chatbot? |
|---|---|---|
| GitHub Actions secret `GROQ_API_KEY` | CI, accidental commits | No |
| Vercel env `GROQ_API_KEY` | Serverless `/api/chat` | **Yes** |
| Frontend JS / HTML | Nothing — visitors can read it | Never put the key here |

Private repo ≠ private key in the browser. Anyone can open the deployed site and read the JS.

---

## Extra guards already in `api/chat.js`

- POST only
- 500-character messages
- last 8 turns only
- ~12 requests / IP / 10 minutes (best-effort; serverless memory is per instance)
- key read only from `process.env.GROQ_API_KEY`

---

## If chat fails after deploy

| Symptom | Fix |
|---|---|
| “Chat is not configured yet” | Add `GROQ_API_KEY` in Vercel and **redeploy** |
| 429 | Groq or site rate limit — wait, or check Groq usage |
| 502 / empty reply | Confirm the model id is still live; set `GROQ_MODEL` |
| Button missing | Footer patch not deployed, or JS error in console |
| Answers invent facts | Knowledge file incomplete — add the missing line, do not loosen the prompt |

---

## What you do **not** need

- A Node/React rewrite of the whole portfolio
- Putting the Groq key in GitHub Secrets *instead of* Vercel
- Calling `https://api.groq.com` from `chatbot.js`
- A database
