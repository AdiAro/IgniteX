# Ignite X — shared version (Firebase + GitHub Pages)

Every student's submission now saves to one shared Firestore database, so you
and your teacher can see all entries together on the leaderboard.

## Files
- `index.html` — landing page
- `submit.html` — idea submission form (name, class, idea)
- `dashboard.html` — a student's own submitted ideas (remembered per device)
- `admin.html` — teacher/organiser leaderboard, PIN-protected
- `firebase-init.js` — your Firebase connection details
- `app.js` — all the shared logic (submitting, scoring, notes, leaderboard)
- `style.css` — styling

## IMPORTANT — before the real event: lock down your database
Right now Firestore is in "Test mode," meaning **anyone** could read or write
to your database if they found the project URL — fine for building and
testing, not fine once real student data is in there. Two things to do
before launch day:

1. **Change the leaderboard PIN.** Open `admin.html`, find this line near the
   top of the script:
   `const EVENT_PIN = 'ignite2026';`
   Change `'ignite2026'` to something only you and your teacher know.

2. **Tighten Firestore's security rules.** In the Firebase console: Firestore
   Database → Rules tab, and replace the rules with something like this
   (allows anyone to create/read ideas, but not delete the whole database):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /ideas/{ideaId} {
         allow read, create, update: if true;
         allow delete: if false;
       }
     }
   }
   ```
   Click **Publish**. (Test mode rules auto-expire after 30 days anyway, so
   this also stops your site breaking mid-event if you forget.)

## Deploy on GitHub Pages (no Netlify, no login issues)
1. Go to github.com → sign up free (just email + password).
2. Click **+ → New repository**, name it `ignite-x`, keep it **Public**,
   don't add a README, then **Create repository**.
3. On the empty repo page, click **uploading an existing file** and drag in
   every file from this folder. Click **Commit changes**.
4. Go to **Settings → Pages**. Under "Branch," choose `main` and `/ (root)`,
   then **Save**. Within a minute or two you'll get a live link like
   `yourname.github.io/ignite-x` — that's what the whole school uses.
5. Share `.../submit.html` (or just the home link) with students, and
   `.../admin.html` with whoever is judging.

## Connecting your friend's rating code
In `app.js`, find `calculateIdeaScore(idea)`. It's currently a placeholder.
Once you have your friend's file, replace what's inside that one function
with a real call to his logic — nothing else in the site needs to change.

## Explaining it to your CBSE evaluator
- Submit an idea live on `submit.html`.
- Open `dashboard.html`, show the countdown and research notes, then use
  "Reveal now (demo)" to skip the 2-day wait and show the score.
- Open `admin.html` (enter the PIN) to show the full-school leaderboard.
