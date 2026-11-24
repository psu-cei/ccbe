# CEI Style Guide extension

**A Chrome extension for building Canvas pages faster.** Instead of rebuilding the same page patterns by hand, you pick a layout or element, set a color, preview it, and insert it straight into the Canvas editor. Everything it inserts uses PSU styling and follows our accessibility rules.

This guide covers installing it, setting it up, and what each section does. Setup takes about ten minutes, most of which is waiting on GitHub.

Questions, problems, or ideas: **Jaimen Gallo** · [Feedback form](https://forms.gle/L6wRWmyK6LMuoZdLA)

---

## Contents

1. [Before you start](#before-you-start)
2. [Install the extension](#install-the-extension)
3. [What the six tabs do](#what-the-six-tabs-do)
4. [Set up My Stuff (optional)](#set-up-my-stuff-optional)
5. [Set up Team Stuff (optional)](#set-up-team-stuff-optional)
6. [File sharing: the no-GitHub way to swap items](#file-sharing-the-no-github-way-to-swap-items)
7. [Good to know](#good-to-know)
8. [When something goes wrong](#when-something-goes-wrong)

---

## Before you start

- **Google Chrome.** The extension uses Chrome extension APIs and will not work in Safari or Firefox. Edge may work but is untested.
- **Canvas access**, obviously. You insert into a page you have permission to edit.
- **A GitHub account**, only if you want to use Team Stuff. Skip it otherwise; everything else works without one.

---

## Install the extension

The extension is not in the Chrome Web Store. You load it from a folder on your own machine, which means it will not auto-update. When Jaimen posts a new release, download it, replace your folder, and click **Reload** on the extension's card in `chrome://extensions`.

**1. Download it.**

Go to <https://github.com/psu-cei/ccbe/releases> and download the `cei-style-guide-v1.3.0.zip` file attached to the newest release. Unzip it somewhere permanent, like your Documents folder.

Do not put it somewhere temporary. Chrome loads the extension from this folder every time it starts, so if you delete or move the folder the extension breaks.

> **Use the release zip, not the green Code button.** The repository ZIP is roughly four times the size and buries the extension inside a subfolder along with the full icon library, which you do not need a copy of.

**2. Load it into Chrome.**

1. Open a new tab and go to `chrome://extensions`
2. Turn on **Developer mode**, top right
3. Click **Load unpacked**, top left
4. Select the unzipped **`PSU_Canvas_Style_Guide`** folder

   Pick the folder that contains `manifest.json`. If Chrome says "Manifest file is missing or unreadable," you selected the wrong level.

**3. Pin it.**

Click the puzzle-piece icon in the Chrome toolbar, find CEI Style Guide, and click the pin. You will use it constantly.

**4. Try it.**

Open any Canvas page, click **Edit**, then click the extension icon. Go to **Layouts**, pick one, and click Insert. If it appears in the editor, you are set up.

> **Working on Windows with OneDrive?** Keep the extension folder out of a synced OneDrive location, or right-click it and choose **Always keep on this device**. OneDrive's Files On-Demand can make the folder look empty to Chrome, which produces the same "Manifest file is missing" error.

---

## What the six tabs do

### My Stuff

Your own saved pages and elements. Paste in HTML you have built or reused, give it a title, and it is one click away forever after. Nobody else sees these unless you deliberately share them.

**To use it:** My Stuff → **+ Add Page or Element** → choose Page or Element, add a title and description, paste your HTML, Save. Click any saved item to insert, edit, copy its HTML, or remove it.

Use **Grid** for thumbnails or **List** for a denser view, and filter by Pages or Elements when the list gets long.

Two ways to get items to other people: share them to [Team Stuff](#set-up-team-stuff-optional), or hand over `.html` files with [File sharing](#file-sharing-the-no-github-way-to-swap-items).

Removing an item that you had shared also takes it out of Team Stuff, so you will not leave something behind for the rest of us after you have deleted your own copy.

### Team Stuff

The same idea, shared across the team. Anything a teammate shares shows up here with their name on it, ready to insert. **You do not need to set anything up to browse and use what others have shared** — a GitHub token is only needed to share your own work.

**To use it:** click any card to see a preview, then **Insert** to drop it straight into Canvas, **Copy HTML**, or **Save to My Stuff** to keep your own copy. Saving a copy is worth it for anything you rely on, because a teammate can unshare their version at any time.

Filter by **Shared by** to see one person's work, search across titles and descriptions, and switch between Grid and List like everywhere else. The bar at the top tells you how many items are shared and by how many people.

### Layouts

Twelve ready-made structures, in two groups.

- **Full Pages** (3): Course Introduction, Module Introduction, Meet the Instructor. These build a whole page.
- **Sections** (9): two-column splits at 50/50, 62/38 and 38/62; three, four and five column grids; and three image layouts.

**To use it:** pick a card, then set your options on the next screen. Every layout has a **Card borders** toggle and a color picker. Course Introduction and Meet the Instructor also give you fields to fill in (course name, instructor details, office hours) so you are not hunting through the HTML for placeholder text. Watch the live preview, then **Insert**.

### Elements

Ten individual components to drop into a page you are already working on: Callout Box, Concept Checker, Accordion, FAQ Show/Hide, Q and A Show/Hide, Knowledge Check, Podcast Transcript, Video Transcript, Show/Hide, and Table.

**Worth knowing:** Accordion, FAQ, Q and A, and Knowledge Check let you set how many items you want (1 to 10) and fill each one in separately. The Table builder handles caption, 2 to 8 columns, 1 to 15 rows, and which cells are headers, so you get an accessible table rather than a grid of plain cells.

### Assets

Icons and buttons.

- **Icons:** 955 across three collections, filterable by category and searchable by name.

  | Collection | Icons | Categories | Styles |
  |---|---|---|---|
  | General | 387 | 9 | Dark, Light |
  | Fill Icons | 532 | 9 | Color, Dark, Light |
  | Icon Banners | 36 | 1 | Color, Dark, Light |

  A handful of Fill Icons were never drawn in every style. Pick a style one of them doesn't have and you get the Color version instead, with a note saying so, rather than a broken image on your page.
- **Buttons:** set size, alignment, text and color. There is no URL field on purpose; add the link in Canvas after inserting, the same way you would any other link.

### Search

Describe what you are trying to build in plain language and it suggests matching layouts and elements. Useful when you know what you want but not what we called it.

---

## Set up My Stuff (optional)

My Stuff works immediately with no setup. Your items are saved in your own Chrome profile.

Connecting a folder is optional and does one extra thing: it also writes each item to your computer as a standalone `.html` file. That gives you a backup you can see, and it means your items survive if your Chrome profile is ever reset.

**To connect a folder:**

1. **My Stuff** → **Folder settings**
2. Click **Choose folder…** and pick any folder you like. A subfolder called `my-stuff` is created inside it.
3. When Chrome asks for permission, choose **Allow on every visit**.

   If you choose "Allow this time," Chrome will ask again every single session. Pick **Allow on every visit** and you will not be asked again.

> **If clicking "Choose folder…" does nothing, or the extension window vanishes:** that is expected. Chrome closes an extension popup whenever a system file dialog takes focus. Click the **Open folder settings in a tab** link on that same screen and do it there instead; the full page does not have this problem.

To disconnect later, use **Disconnect folder**. Files already written are left alone; nothing is deleted.

---

## Set up Team Stuff (optional)

**You do not need this to browse.** Open Team Stuff and you can already see and insert everything teammates have shared. A token is only needed to share your *own* items.

### Step 1: Check you have access

Open <https://github.com/psu-cei/ccbe> while signed in to GitHub. If you see an **Add file** button, you have what you need. If you get a 404, ask Jaimen to add you first.

### Step 2: Create a token

1. Go to <https://github.com/settings/personal-access-tokens/new>
2. **Token name:** `CEI Style Guide extension`
3. **Resource owner:** change this from your own username to **`psu-cei`**

   This is the step people get wrong. A token owned by your personal account cannot touch the team repo no matter what else you set.

   If a justification box appears, write something like *Sharing Canvas page templates through the CEI Style Guide extension.*
4. **Expiration:** 90 days is reasonable. Note the date; you will repeat these steps when it expires.
5. **Repository access:** **Only select repositories** → pick **`ccbe`**
6. **Permissions** → **Repository permissions** → **Contents** → **Read and write**

   Leave everything else alone. Contents is the only permission the extension uses.
7. **Generate token**, then **copy it immediately**. It starts with `github_pat_` and GitHub will not show it again.

### Step 3: Wait for approval, if asked

If GitHub says your token is **pending approval**, message Jaimen. An owner of `psu-cei` has to approve it.

This is worth understanding because of how it fails. A pending token can still read public things, so Team Stuff will look completely normal and only sharing will break. If you connect a pending token, the extension will tell you plainly that you do not have write access yet.

### Step 4: Connect it

**Team Stuff** → **Connection settings** → paste the token → **Connect**.

You should see "Connected as *yourusername*." The extension checks both that the token is valid and that it can actually write to the repo, so you find out about a problem now rather than when a share silently fails later.

### Step 5: Share something

**My Stuff** → click an item → **Share with the team**. The button turns green.

Your item becomes a file in the team folder, committed under your GitHub account with your name in the file name. Everyone else sees it in Team Stuff.

Click the button again to stop sharing. The item disappears from everyone's Team Stuff, but the file stays in the repo with its history. Nothing is deleted.

Deleting the item from My Stuff altogether also unshares it, so you do not have to remember to do both.

**Edit a shared item and your change does not go out on its own.** Sharing takes a snapshot. Click the toggle off and on again to push the new version, which also means a teammate's copy never changes under them while they are using it.

---

## File sharing: the no-GitHub way to swap items

There are two ways to get your work to a teammate, and they are not alternatives so much as different tools.

| | **Team Stuff** | **File sharing** |
|---|---|---|
| How it travels | Through the team's GitHub repo | As `.html` files you hand over |
| Setup needed | A GitHub token, once | None |
| Who sees it | Everyone on the team, automatically | Only the person you send the files to |
| Good for | Anything worth keeping around | One-offs, drafts, anyone without GitHub |

**Use Team Stuff by default.** Use File sharing when the other person has no GitHub access yet, when you want to send something to one person rather than the whole team, or when you would rather not put the item in a public repo.

File sharing lives behind the yellow **File sharing** button next to the "Add to My Stuff" heading.

### Set your name first

Open **My Stuff** → **+ Add Page or Element** → **File sharing**, type your name in **Your name**, and click **Save**.

Your name is written into every file you export, so whoever opens it can see who made it. It is stored only on your computer and is never taken from your email address. Do this once and forget about it.

### Send items to a teammate

1. **My Stuff** → **+ Add Page or Element** → **File sharing**
2. Click **Export to a folder…** and pick a folder, or make a new empty one
3. Every item you have saved is written there as a separate `.html` file

Now send that folder however you normally would: Teams, OneDrive, email, a zip. If you only want to send some of your items, delete the ones you do not want from the exported folder before sending. The export does not change anything in My Stuff.

### Receive items from a teammate

Two routes, depending on what they sent you.

**They sent you loose files:** **File sharing** → **Import files…** → select one or several `.html` files at once.

**They sent you a whole folder:** **File sharing** → **Import from another folder…** → pick the folder. This reads the folder once and does not connect it; your own My Stuff folder is left alone.

Either way the imported items appear in My Stuff labelled with the sender's name, so you can tell them from your own work.

### What happens to duplicates

If you import something you already have, the extension compares the two and keeps whichever was edited more recently. Your copy is never silently overwritten by an older one.

A file you made yourself and get back from someone else loses the "from" label, so re-importing your own work does not make it look like a teammate's.

> **If the extension window disappears when you click Export or Import:** Chrome closes extension popups whenever a file dialog opens. Click **open the full page** on that same screen and do it from there.

---

## Good to know

**The team repo is public.** `psu-cei/ccbe` is open to anyone on the internet and has to stay that way, because the icons the extension inserts are served from it and must load for students who do not have the extension. **Do not share anything to Team Stuff that contains student names, grades, unpublished material, or anything else you would not put on a public web page.**

**Your token can write to the whole repo.** GitHub scopes these tokens to a repository, not a folder, so a token that can write to the shared folder can also write to the extension's code. Treat it like a password. Do not paste it into chat, email, or a document.

**Everything inserted uses inline styles.** Canvas strips `<style>` blocks out of pages, so every layout and element carries its styling inline. That is why the HTML looks dense if you open it.

**H2 is the highest heading level.** Nothing the extension inserts uses an H1, because the Canvas page title is already the H1. Keeping one H1 per page is a basic accessibility requirement.

**Fonts are inherited.** Inserted content has no font-family of its own, so it picks up whatever Canvas is using. That is deliberate; it means our content never looks pasted in.

---

## When something goes wrong

**"Manifest file is missing or unreadable."**
You selected the wrong folder. Pick the one containing `manifest.json`. On Windows with OneDrive, see the note at the end of the install section.

**Insert does nothing.**
You need a Canvas page open **in edit mode** in the active tab. The extension inserts into the Canvas editor; if the editor is not open there is nowhere to put the content.

**The extension vanishes when I click "Choose folder…".**
Expected. Chrome closes extension popups when a file dialog opens. Use **Open folder settings in a tab**.

**"GitHub rejected the token."**
Expired, revoked, or mistyped. Generate a new one and reconnect.

**"The token works, but you do not have write access."**
One of three things: resource owner was left as your personal account, the `ccbe` repository was not selected, or the token is still pending approval.

**"GitHub rate limit reached."**
If you are connected you should never see this. If you are not connected, the anonymous limit is 60 requests an hour. Connect a token, or wait the number of minutes the message gives you.

**Team Stuff is empty.**
Click **Check again**. If it stays empty, use **Open the folder on GitHub** from Connection settings and confirm files are actually there.

**A preview box is blank.**
Some saved items are Canvas file embeds rather than page content. Those need you to be signed in to Canvas, and they may still not preview. They will insert and display correctly in Canvas regardless.

---

## Support and feedback

**Questions, bugs, or anything confusing:** contact **Jaimen Gallo**.

**Ideas for the next version:** [CEI Style Guide Extension Feedback form](https://forms.gle/L6wRWmyK6LMuoZdLA). Tell us what is working, what is not, and what you want added. Specific examples help, and the small annoyances are worth reporting too.

---

*Current version: 1.3.0. The extension does not auto-update; Jaimen will let you know when a new version is ready.*
