# Little Light

Little Light is a mobile-first positivity and perspective app.

Its core idea:

> Do not let one difficult part of life become the whole life.

The app helps a user save small pieces of positive evidence from real life,
separate their own life from the struggles of someone they love, reflect weekly
and monthly, and connect today's actions to a larger future.

## Live App

https://little-light.allophones.chatgpt.site

## Current MVP

- Today: save short positive moments with category, owner, and future-signal tags
- Rescue: choose the kind of bad day and get perspective based on the trigger
- Sunshine: weekly and monthly summaries split into Me, Him, and Us
- Future Light: connect current evidence to a longer-term life direction
- Local persistence: saved entries are stored in browser localStorage
- PWA support: includes app manifest and mobile home-screen icons

## Run Locally

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Build

```bash
npm run build
```

## Notes

This is currently a progressive web app, not a native iOS app. It can be added
to a phone home screen from Safari or Chrome and iterated quickly.

Future versions can add:

- account login
- cloud sync
- database-backed moments
- AI-generated reflections
- notifications
- photos
- TestFlight/App Store packaging
