# Quiz Platform - Claude Project Guide

## Quick Start

```bash
cd /Users/s/Quiz
npm run dev          # Dev server on http://localhost:5175 (configured in .claude/launch.json)
npm run build        # Build to dist/
vercel deploy --prod dist/ --yes  # Deploy to https://dist-tau-kohl-55.vercel.app
```

## Project Overview

Multi-quiz React platform with two quiz modules:
1. **100 Concepts Puissants** - Philosophy, psychology & business (100 questions, 10 themes)
2. **Quiz DZ -- Cards DZ** - Algerian culture, history & heritage (384 questions, 5 themes) with GOSTO branding

**Live URL**: https://dist-tau-kohl-55.vercel.app
**GitHub**: https://github.com/SalimSa/Quiz-100-Concepts (branch: master)

## Tech Stack

- **React 19** + **Vite 6** (zero extra dependencies)
- **CSS** vanilla with CSS variables, scoped themes via `.quiz-dz` class
- **localStorage** for user profiles, game history, leaderboard, saved quiz progress
- **Vercel** for deployment (static dist/ folder)

## Architecture

```
src/
  App.jsx              # Main app (908 lines) - ALL screens: login, hub, profile, home, quiz, results, review
  main.jsx             # Entry point
  styles.css           # All styles (1700+ lines) including GOSTO DZ theme
  components/
    DetailCard.jsx     # Expandable detail card with Wikipedia links
    Confetti.jsx       # Celebration animation on results screen
  data/
    quizRegistry.js    # Quiz definitions array + getQuiz(id) helper
    quizData.js        # "100 Concepts" quiz data (100 questions + conceptDetails)
    quizDZ.js          # DZ quiz data (384 questions, 5 themes, 3 difficulty levels)
    dzConceptDetails.js # Detail cards for all DZ answers (Wikipedia URLs, descriptions, visuals)
    utils.js           # shuffle, norm, lev (Levenshtein), checkAnswer (fuzzy), selectQuestions, genId
public/
  gosto-pattern.svg    # Cultural Algerian SVG pattern (fennec, tagine, mosque, camel, etc.)
```

## Key Patterns

### Quiz Registry (`quizRegistry.js`)
Each quiz is an object with: `id`, `title`, `icon`, `description`, `gradient`, `catColors`, `allQuestions`, `conceptDetails`, `questionCounts`, `hasDetailCards`, `questionTypes`. To add a new quiz, add an entry here and create its data file.

### Theme Scoping
DZ quiz uses GOSTO branding via CSS class `.quiz-dz` applied to the app root:
```jsx
const isDZ = activeQuizId === "dz";
<div className={`app${isDZ ? " quiz-dz" : ""}`}>
```
All DZ overrides in styles.css use `.quiz-dz .xxx` selectors.

### GOSTO Brand Colors
```css
--gosto-green: #1B6B3A;
--gosto-green-light: #2D8B55;
--gosto-red: #C41E3A;
--gosto-gold: #D4A017;
--gosto-brown: #8B5E3C;
```

### DZ Category Colors
```js
dzCatColors = {
  Cuisine: "#D4A017",
  "Arts & Culture": "#1B6B3A",
  "Histoire & Lieux": "#C41E3A",
  Musique: "#8B5E3C",
  Sports: "#2D8B55"
}
```

### Question Format (DZ)
```js
{
  theme: "Cuisine",
  type: "qcm",        // qcm | devinette | intrus
  question: "...",
  answer: "La Chorba",
  options: ["A", "B", "C"],  // for qcm
  alts: ["Chorba"],          // alternative accepted answers (fuzzy matching)
  intrus: "...",             // for intrus type
  level: 1,                 // 1=Facile, 2=Moyen, 3=Expert
  url: "https://fr.wikipedia.org/wiki/..."
}
```

### App Screens Flow
`login` -> `hub` (quiz list) -> `home` (question count selection) -> `quiz` (gameplay) -> `results` -> `review`
- Profile accessible from hub (avatar button)
- Save & resume: can exit mid-quiz, progress saved in localStorage, resume from hub

### Timer System
- 30 seconds per question (uniform across all difficulty levels)
- Timer is optional (toggle on home screen)
- Total timer = questionCount * 30 seconds

### Question Counts
- 100 Concepts: 30, 50, 100
- DZ Quiz: 30, 50, 100, 300 (labels: Facile/Pro/Expert/Ultra)

### Skip/Pass System
- "Passer" button during gameplay
- Skipped questions get a 2nd pass at the end
- `skippedPass` state tracks if we're in the 2nd round

### Fuzzy Answer Matching (`utils.js`)
Uses Levenshtein distance with adaptive thresholds:
- Words <= 5 chars: max 1 edit distance
- Words <= 10 chars: max 2
- Longer words: max 3
Also accepts partial matches (substring) if >= 3 chars.

### Question Selection (`selectQuestions`)
Balanced across themes and difficulty levels:
- Per theme: distributes questions as easy/medium/hard ratio
- Then shuffles and slices to target count

### Detail Cards
After answering, users can expand a detail card showing:
- Concept title with emoji
- Description text
- Wikipedia link (styled as prominent button)

## Deployment

```bash
# Build
npm run build

# Deploy to Vercel (static)
vercel deploy --prod dist/ --yes
# Alias: https://dist-tau-kohl-55.vercel.app
```

No `vercel.json` needed - deploys dist/ as static files.

## Dev Server Config (`.claude/launch.json`)

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "Quiz",
      "runtimeExecutable": "bash",
      "runtimeArgs": ["-c", "cd /Users/s/Quiz && npx vite --port 5175"],
      "port": 5175
    }
  ]
}
```

## localStorage Keys
- `quiz_user` - User profile `{ name, createdAt }`
- `quiz_history` - Array of completed game results
- `quiz_lb` - Leaderboard entries
- `quiz_saved_*` - Saved quiz progress (per quiz ID)

## Recent Changes Log
- GOSTO branding: green/red theme, cultural SVG background pattern
- Quiz topbar: quiz title + theme name + avatar + save/quit button
- Skip/pass button with 2nd pass for unanswered questions
- Detail link restyled as prominent button
- 12 Wikipedia URL corrections from Excel verification
- Timer standardized to 30s per question
- Ultra mode: 300 questions
