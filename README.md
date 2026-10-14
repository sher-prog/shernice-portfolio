# Shernice Chetty — Portfolio

Computer science student at Hunter College, CUNY (B.S., graduating May 2027), interested in where technology breaks down for real people and building things that hold up.

Open to internships, research collaborations and tech-for-good projects.

**Live site:** [shernice-portfolio.vercel.app](https://shernice-portfolio.vercel.app)

**Contact:** [shernicechetty02@gmail.com](mailto:shernicechetty02@gmail.com) · [LinkedIn](https://www.linkedin.com/in/shernice-chetty) · [GitHub](https://github.com/sher-prog)

## Experience
- **Research Assistant, TIER Lab** (2026 – now): audio modality of MultiCogTrust, studying how the sound of a system shapes trust.
- **Co-technical lead, NYU x Hunter College AI chatbot initiative** (2026 – now).
- **College Assistant, BMCC Enrollment Services** (2023 – 2026).
- **Personal Financial Advisor, Old Mutual SA** (2018 – 2019).

## Projects
- **SafeExit** ([code](https://github.com/sher-prog/mzansi-safe-haven)): a discreet safety-planning app for people preparing to leave an abusive relationship, built with a TEARS Foundation pitch in mind. See below.
- **A Little Bit of Home** ([code](https://github.com/sher-prog/a-little-bit-of-home)): a dependency-free recipe site with a strict Content-Security-Policy, built to grow into a community recipe collection.
- **Jackie** ([code](https://github.com/sher-prog/cirilla)): a personal AI assistant built on the Claude API and LangGraph, with model routing and prompt-injection guards.
- **MultiCogTrust, NYU AI chatbot, Project Aegis:** research and clinical-safety AI work. These are private and owned by the organizations involved, so the code is not public.

## SafeExit in detail

**What it is.** Leaving an abusive relationship is often the most dangerous moment, and an app called "safety" on a monitored phone can put its owner at risk. SafeExit looks like an ordinary South African recipe app. A hidden gesture opens the real toolkit underneath, locked behind a PIN that only the user knows. It complements, and does not replace, the TEARS Foundation USSD line, which works on any phone without data.

**What it does.**
- **Exit plan:** a checklist of documents, essentials and safety steps.
- **Get help:** national helplines, one tap from a call.
- **Notes:** a dated incident journal with optional photos and voice recordings.
- **Vault:** photos of ID, financial, medical and legal documents.
- **Evidence pack:** a court-ready PDF with an incident log, the original photos and a SHA-256 fingerprint for every file, so a reader can tell the evidence has not been altered.
- **Encrypted backup and restore** to another phone, and a UI in English, isiZulu, isiXhosa and Afrikaans.

**How it works.**
- **Local only.** No server, account or cloud. Nothing leaves the device unless the user exports a file.
- **Encryption.** The 4 to 6 digit PIN is stretched into a key with PBKDF2 (310,000 iterations) and used with AES-256-GCM through the browser's WebCrypto API. The PIN itself is never stored.
- **No PIN recovery, on purpose,** because any reset route would also be a way in for someone else.
- **Automatic lock** when the user switches apps, locks the phone or presses Escape.
- **Discreet by design:** a wrong PIN only says the code is not recognised, so nothing reveals that a hidden mode exists.

**Built with** React, TypeScript, Vite, Tailwind CSS, Framer Motion and jsPDF, tested with Vitest. Photos and audio are stored in the browser's IndexedDB.

**Status.** Still in active development and not yet independently security-reviewed. The translations other than English still need review by native speakers.

## About this site
A scroll-driven portfolio built with React, Vite, GSAP and WebGL. It works on desktop and mobile and respects reduced-motion settings.

## Run it locally
Requires [Node.js](https://nodejs.org) 20.19 or newer (or 22.12+).

```
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

To build the static site, run `npm run build`. The output goes to `dist/`, and `npm run preview` serves it locally.
