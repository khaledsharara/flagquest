# FlagQuest

An ad-free iPhone app for learning the world's countries: flags, country shapes, where they are on the
map, and capitals. Made for sideloading with SideStore.

- **197 countries** (UN members plus Vatican City, Palestine, Kosovo and Taiwan), grouped by continent.
- **Levels:** each continent is split into levels of 6–8 countries, best-known first (ordered by population
  and size). Score 60% to earn a star and unlock the next level; 80% gives two stars and 100% gives three.
- **Quiz modes:** Mix, Flags, Shapes, Map and Capitals. Each mode tracks its own stars.
- **Question types:** name the flag, pick the flag, name the shape, pick the shape, name the highlighted
  country, tap the country on a zoomable map, and pick the capital. Missed countries come back once at the
  end of the round as a "second chance".
- **Endless practice** has three scopes:
  - **Level:** repeats one level's countries until you stop.
  - **Continent:** every country you've practiced in that continent.
  - **Everything:** every country you've practiced anywhere.

  It asks about weaker countries more often, and in Mix mode it targets each country's weakest skill. Tap
  **Done** for a summary of what you've newly mastered and what needs more work. Questions never move on by
  themselves; you always tap **Next**.
- **Mastery:** every answer, in quizzes or endless practice, updates a per-country, per-skill score (flags,
  shapes, map, capitals). Each right answer moves it up one step and a mistake drops it two; three steps up
  means mastered. The dots on the study cards show this progress for the current mode.
- **Study:** every level has flashcards, and the Atlas lets you search every country. Each country page shows
  its flag, shape, location, capital, population, area and neighbors.
- Works fully offline, follows light/dark mode, and gives haptic feedback on iPhone.

## Install on iPhone (SideStore)

1. Open the repository's **Releases** page on your iPhone and download `FlagQuest.ipa` from the `latest`
   release.
2. In SideStore, go to **My Apps**, tap **+**, and pick `FlagQuest.ipa` from Files.
3. Refresh it in SideStore like your other apps (free Apple IDs need a refresh every 7 days).

Each push to `main` rebuilds the app on GitHub Actions (macOS runner) and replaces the `latest` release.

## Development

```bash
npm install
npm run dev        # http://localhost:5173 (use a phone-sized window)
npm run build      # typecheck + production build into dist/
```

`npm run data` regenerates `public/data` and `public/flags` from the npm data packages (dev and build run it
automatically).

### Layout

```
src/modules/
  shared/   UI building blocks (Screen, Button, Stars…), storage + haptics bridge, helpers
  atlas/    country data, flags, shapes, maps (d3-geo), Atlas + country pages
  levels/   continents → levels, progress (stars + mastery), home/continent/level pages
  quiz/     question generation, question views, quiz + results
  practice/ endless practice: scopes, weighted question picking, session summary
scripts/build-data.mjs   builds the bundled data (levels, shapes, flags)
ios/                     SwiftUI + WKWebView shell (XcodeGen spec)
```

The iOS app is a thin native shell around the web build. It serves the files from the app bundle through a
custom URL scheme (`flagquest://`), saves progress to `UserDefaults`, and triggers haptics. To build it on a Mac
instead of CI:

```bash
npm run build && rm -rf ios/web && cp -R dist ios/web
cd ios && xcodegen generate && open FlagQuest.xcodeproj
```

## Data and licences

- Country shapes: [Natural Earth](https://www.naturalearthdata.com/) via `world-atlas` (public domain)
- Flags: `svg-country-flags` (public domain)
- Names, capitals, regions and borders: [mledoze/countries](https://github.com/mledoze/countries) (ODbL)
- Population estimates: Natural Earth `POP_EST`, stored in `scripts/data/population.json`
