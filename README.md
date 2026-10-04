# SpeakUp SD Showcase

Public product showcase for **SpeakUp SD**, a voice-first system design interview practice product.

SpeakUp SD helps candidates turn interview preparation into a repeatable loop: choose a realistic system design prompt, explain the architecture aloud, draw the system, and review AI feedback grounded in the practice session.

## Live Surfaces

| Surface | Link |
|---|---|
| Canonical public showcase | https://quietbranch88.github.io/speakup-sd-showcase/ |
| Free question bank | https://speakupinterview.com/ |
| Practice app | https://speakupinterview.com/app/ |
| iOS | Internal TestFlight validation before public App Store release |

## What This Repo Demonstrates

- **Real product screenshots** for the question bank, AI interview workspace, consent modal, whiteboard, and reports.
- **Product positioning** for system design interview practice in the AI-agent era.
- **Unlimited no-AI Open Practice** with a timer, local recording, and desktop whiteboard.
- **Four-phase voice practice** across requirements, high-level design, technical deep dive, and trade-offs.
- **Simulation and Guided Practice** paths, with optional between-phase coach reminders.
- **Voice and whiteboard evidence** kept together for review.
- **One combined report and next drill** that turn a completed interview into a focused follow-up.
- **Honest availability status** for the live web product and private iOS beta.
- **Trust boundary** between public showcase content and private application code.

The whiteboard and reports screenshots show empty workspaces. A completed AI feedback report is not included in the current public gallery.

## Engineering Contribution

I independently built and operate the product behind this showcase.

- **Backend workflow:** Built a FastAPI/PostgreSQL workflow that separates request acceptance from asynchronous speech processing and report generation.
- **Durable submission:** Implemented transactional job creation and idempotent submission so a retry can return an existing job instead of admitting duplicate local work.
- **Report pipeline:** Connected audio and whiteboard context to transcription, structured AI reports, and persistent report history, with explicit stage and failure states.
- **Release verification:** Used synthetic accounts and scripted checks to validate selected runtime and browser paths. These checks establish the tested behavior, not user adoption, scoring accuracy, or an availability guarantee.

This is a high-level summary of my implementation work. Private source code, user content, prompts, and operational details are not published here.

## Showcase Structure

```text
.
├── index.html              # Public GitHub Pages product page
├── styles.css              # Responsive visual system for the showcase
└── assets/
    ├── showcase-preview.png
    ├── product-question-bank.png
    ├── product-question-bank-list.png
    ├── product-interview-active.png
    ├── product-recording-consent.png
    ├── product-practice.png
    ├── product-board.png
    └── product-reports.png
```

## Public Boundary

This repository is intentionally limited to public-facing product content:

- product positioning
- high-level engineering contribution summary
- screenshots and demo flow assets
- static GitHub Pages implementation
- links to legal and production app surfaces

It does **not** include private application source code, credentials, internal specifications, deployment secrets, customer data, model prompts, evaluation datasets, or operational runbooks.

## Product Notes

SpeakUp SD is built around a simple product belief: system design confidence comes from reps, evidence, and feedback.

The showcase focuses on the visible user experience rather than the private implementation. The product itself includes practice prompts, spoken-answer flow, whiteboard work, reports, progress surfaces, and trust/legal pages.

Built by **Quiet Branch** — practical AI products where evaluation, privacy, and backend reality are part of the product design.

## Maintenance

### Showcase languages

The showcase supports English, French, Traditional Chinese and Hindi through the
header language selector. The initial language is English. A selected language is
stored only in this site's browser localStorage (`speakup-showcase-language`) until
changed or browser site data is cleared; it is not transmitted to a server.
Switching still works when storage is blocked. Without JavaScript, the English
page remains usable. Original product screenshots and linked app/legal pages keep
their own language. This does not assert language support inside the product.

Public copy is in `translations.js`; `language.js` applies it to the HTML's
`data-i18n` markers, accessible labels and metadata. Keep every locale's keys in sync.
Use Node.js 22 or newer. Run `npm ci --ignore-scripts` to install the locked
development-only Playwright dependency, then `npx playwright install chrome`
if Chrome is not installed. Run `npm run check`, `npm test` and
`git diff --check`. `PLAYWRIGHT_MODULE` can optionally select an existing installation.
The `Verify showcase` workflow runs these checks on pull requests and main pushes.
Pages publication is a separate workflow; this check does not itself enforce branch protection.
The test starts its own local static server. Set `SCREENSHOT_DIR` to an optional
local output folder for screenshots. No production services are used by this test.

This repo is suitable for GitHub Pages. Updates should keep the page focused, screenshot-driven, and safe for public review.
