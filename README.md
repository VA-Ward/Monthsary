# Eleven moons

Her 11th monthsary site. Same setup as the birthday one: put the files in a GitHub repository, turn on Pages, done.

```
index.html      the site
style.css       the look
app.js          the moving parts
content.js      every word and photo on the page
admin.html      the editor (only you use this)
images/         the photos
```

---

## 1. Put it online (about five minutes)

1. github.com → **New repository**. Call it `monthsary` (or anything). Set it **Public** and create it.
2. On the new repo page click **uploading an existing file**. Open the unzipped folder, select **everything inside it** (the files and the `images` folder) and drag it all in. Then **Commit changes**.
3. **Settings** → **Pages** → Source: **Deploy from a branch**, Branch: **main**, folder **/ (root)** → **Save**.
4. Give it a minute, then open `https://va-ward.github.io/monthsary/`

The editor lives at `.../admin.html`. Bookmark that one.

Drag the *contents* of the folder, not the folder itself, or the site ends up one level too deep and the link shows a 404.

---

## 2. Let the editor publish

1. GitHub → avatar → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**. (Or edit the token you made for the birthday site and add this repo to it.)
2. **Repository access** → *Only select repositories* → pick the new repo.
3. **Permissions** → **Contents** → **Read and write**. Generate and copy it.
4. Open `admin.html`, fill in your username, the repo name and the token, tick **Remember on this device**.

The token stays in your browser. It is never written into the site.

---

## 3. Make it yours

Open the editor and change anything, then press **Publish to GitHub**. The live site updates in a minute or two.

Worth personalising first:

- **Month by month.** Eleven short notes, one per month, December to October. They are written to be safe guesses. Swap in what actually happened.
- **The letter.**
- **Reasons in the jar.** Thirty-one, one for each day until the first anniversary. The last one in the list always comes out last.
- **Photos.** Drop new ones in and write a short caption for each. Short captions look best on a polaroid.

---

## The seal

It ships sealed until **midnight on 30 October**, on her clock. Before that, the link shows the moon, the countdown and nothing else, then it opens itself on the stroke of midnight even if the page is already open.

Add `?preview` to the address to see everything early: `https://va-ward.github.io/monthsary/?preview`

Like last time, this hides the page, it doesn't encrypt it. The words sit in `content.js` in a public repo.

## Music

The button plays the song from the birthday site, so nothing extra to upload. To use a different song, drop an mp3 into the editor and publish.

## What's on the page

1. The moon. It waxes to full as the page opens, with a live count of how long you've been together and how many days until the first year.
2. A letter under a wax seal.
3. Month by month. Eleven moons round a clock face. She taps each one to fill it and read that month. When all eleven are full, the twelfth lights up.
4. Swipe through us. A stack of polaroids to fling away one by one.
5. How much? Press and hold the heart. It fills, overflows, and goes to infinity.
6. A jar of reasons. Tap for a folded note. It remembers which ones she has already pulled.
7. Three scratch cards with little promises.
8. Will you keep choosing me? The No button runs away.
9. A sky lantern she writes a wish on and lets go. Nothing is saved.

Tapping anywhere else on the sky leaves a few little hearts.

Works on phones, respects "reduce motion", and is marked noindex so it stays out of Google.
