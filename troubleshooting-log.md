# Development Issues & Fixes Log

A running record of technical issues hit during development and how each was resolved. Kept as a working reference — useful when writing the supporting documentation (particularly for evidencing problem-solving and AI-tool-usage transparency).

---

## 1. Git: ~1700 files staged unexpectedly
**Phase:** Project setup
**Cause:** Ran `npm install` before creating a `.gitignore`, so the entire `node_modules/` folder (thousands of files) got staged in Source Control.
**Fix:** Created `.gitignore` excluding `node_modules/`, `.env`, and `.DS_Store` — deliberately *not* excluding the database file, since the brief requires it in the final submission. Ran `git reset` to safely unstage everything (nothing had been committed yet, so nothing was lost).

---

## 2. Git: "src refspec main does not match any"
**Phase:** First push to GitHub
**Cause:** Tried to publish/push the branch before making any commit. Git can't push a branch that doesn't exist yet — `main` only exists once at least one commit has been made on it.
**Fix:** Staged files, wrote a commit message, and committed (⌘+Enter in VS Code's Source Control panel) before retrying "Publish Branch."

---

## 3. Image licensing check — jellyfish background (Deep Sea Trench zone)
**Phase:** Sourcing homepage/zone imagery
**Issue:** First candidate image (from 4kwallpapers.com) was licensed for personal desktop wallpaper use only, with no legitimate path to using it on a coursework website.
**Fix:** Replaced it with a jellyfish image from wallpaperscraft.com, licensed under Creative Commons Attribution (CC BY), credited to photographer "ume-y" via Flickr. Both this image and the homepage hero photo (Pexels License) are logged with source, photographer, license type and usage in `content-sources.md`.

---

## 4. EJS comment syntax
**Phase:** Building the homepage template (`views/home.ejs`)
**Cause:** Used plain JavaScript-style `//` comments outside of `<% %>` scriptlet tags. Outside a scriptlet, `//` isn't valid EJS syntax — it would have been rendered as literal visible text on the page instead of being hidden.
**Fix:** Switched to EJS's actual comment tag, `<%# ... %>`, which is always stripped from the rendered output no matter where it's placed in the template.

---

## 5. Blank homepage / HTTP 403 Forbidden at localhost:5000
**Phase:** First browser test of the running server
**Symptoms:** Completely blank page in every browser tested. Browser DevTools Elements panel showed an empty `<body>`. Network tab showed the actual response was `HTTP 403 Forbidden`, not a normal page load.
**Investigation steps, in order:**
  1. Verified `index.mjs` and `home.ejs` were both correct by reading the files directly — ruled out a code bug.
  2. Tested in a Private/Incognito browser window — still blocked, ruling out a browser extension.
  3. Ran `curl -v http://localhost:5000` directly in Terminal, bypassing the browser entirely. The response headers included `Server: AirTunes/960.13.1` — a header that has nothing to do with Node or Express.
**Cause:** macOS's built-in **AirPlay Receiver** (part of Control Center, enabled by default since macOS Monterey) listens on port 5000 by default — the same port required by the coursework brief for the Express server — and was intercepting the request before it ever reached Node.
**Fix:** Disabled AirPlay Receiver via System Settings → General → AirDrop & Handoff → toggled "AirPlay Receiver" off. Restarted the server (`node index.mjs`); the homepage then rendered correctly. Port 5000 itself was kept unchanged (not moved to a different port), because the brief specifically requires the marker to be able to load the site at `http://localhost:5000` on their own machine without editing any code.

---

*This log is a personal working reference, not a polished writeup. Entries can be adapted into the supporting documentation as needed — #5 in particular shows a structured debugging process (checking the DOM, then the network layer, then ruling out the browser entirely) that may be useful evidence of problem-solving, and every entry here involved AI assistance in diagnosing and/or resolving the issue, which is relevant to the AI-tool-usage transparency section.*

---

## 6. Git: commits silently failing ("no changes" despite staging/committing)
**Phase:** Zone pages / Journal (Phase 5)
**Symptoms:** Staged and "committed" changes in the Source Control panel, but `git log` and `git status` showed nothing had actually landed — no error appeared to explain why.
**Investigation steps:**
  1. Ran `git status` directly in the terminal instead of trusting the VS Code UI — it surfaced a warning: `unable to unlink '.git/index.lock': Operation not permitted`.
  2. Confirmed the lock file (`.git/index.lock`) genuinely existed on disk and Git could not remove it, which blocks every subsequent `git add`/`git commit` with `fatal: Unable to create '.git/index.lock': File exists`.
**Cause:** A previous git operation was interrupted before it could clean up its own lock file, leaving a stale `.git/index.lock` behind.
**Fix:** Deleted the stale `.git/index.lock` file directly, then re-ran `git status` to confirm Git was unblocked. Re-staged and committed the zone-pages/Journal work successfully afterwards.
