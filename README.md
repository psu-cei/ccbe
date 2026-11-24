# CCBE — CEI Style Guide extension

A Chrome extension for building Canvas pages faster. Instead of rebuilding the same page patterns by hand, you pick a layout or element, set a color, preview it, and insert it into the Canvas editor. Everything it inserts uses PSU styling and follows our accessibility rules.

Built and used by the Center for Educational Innovation at Penn State Behrend.

## Install

Download the latest `cei-style-guide-vX.Y.Z.zip` from [Releases](https://github.com/psu-cei/ccbe/releases), unzip it somewhere permanent, then in Chrome go to `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and select the unzipped folder.

Do not download the repository ZIP. It is about four times larger and you would have to find the right subfolder inside it.

**[Full setup and usage guide →](PSU_Canvas_Style_Guide/CCBE_TEAM_GUIDE.md)** — covers installation in detail, connecting a My Stuff folder, getting a GitHub token for Team Stuff, what every panel does, and troubleshooting.

## What is in it

Six panels:

| Panel | What it does |
|---|---|
| **My Stuff** | Your own saved pages and elements |
| **Team Stuff** | Everything teammates have shared, ready to insert |
| **Layouts** | 12 structures: 3 full pages, 9 section patterns |
| **Elements** | 10 components, including an accessible table builder |
| **Assets** | 955 icons across 3 collections, plus a button builder |
| **Search** | Describe what you want and get matching layouts back |

## Repository layout

```
PSU_Canvas_Style_Guide/   the extension itself — this is what you install
assets/icons/             the full icon library, every colour variant
assets/shared/            Team Stuff: items CEI staff have shared with each other
```

Inserted icons point at `raw.githubusercontent.com` rather than at files inside the extension, because a Canvas page has to render for students who do not have the extension installed. That is why this repository is public and needs to stay that way.

The extension packages its own copy of the icon files it previews in the popup, so those appear in both places on purpose.

## For maintainers

Regenerate the icon libraries after adding or changing PNGs, rather than editing the generated `*-icon-library.js` files by hand:

```
cd PSU_Canvas_Style_Guide
node scripts/generate-icon-libraries.js
```

It reports any icon missing a colour variant and any two filenames that collide into the same key. Push changed PNGs to this repository as well as packaging them, since inserted HTML loads them from here.

## A note on what goes in `assets/shared`

Anything shared to Team Stuff lands in a public folder on the open internet. Do not share pages containing student names, grades, unpublished course material, or anything else you would not put on a public web page.

## Support

Contact **Jaimen Gallo**, or use the [feedback form](https://forms.gle/L6wRWmyK6LMuoZdLA).
