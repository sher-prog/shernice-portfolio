
export const HERO = {
  name: 'Shernice Chetty',
  tagline: 'Computer science student interested in all things Tech!',
  thesis: 'I like asking where technology breaks down for real people, then building something that holds up. Take a look at what came out of it.',
}

// `stop` picks the camera position from STOPS in config.js.
export const TIMELINE = [
  {
    stop: 'finance',
    period: '2018 — 2019',
    place: 'Old Mutual SA',
    role: 'Personal Financial Advisor',
    body: 'Sat down with clients to map out budgets, savings, insurance and retirement plans. Learned how to explain money in plain language and earn trust with people making big decisions.',
  },
  {
    stop: 'bmcc',
    period: '2023 — 2026',
    place: 'BMCC Enrollment Services',
    role: 'College Assistant',
    body: 'Worked in the enrollment office while enrolled at BMCC: helped students through admissions, registration and financial aid questions, many of them first-generation or new to the US, like I was.',
  },
  {
    stop: 'hunter',
    period: 'Graduating May 2027',
    place: 'Hunter College, CUNY',
    role: 'B.S. Computer Science',
    body: 'Transferred in from BMCC to finish my CS degree. Outside class, I stay active in Blackstone LaunchPad, MLH and Rewriting the Code, communities for building, shipping and getting more women into tech.',
  },
  {
    stop: 'tier',
    period: '2026 — now',
    place: 'TIER Lab',
    role: 'Research Assistant',
    body: 'Research assistant under Dr. Raj Korpan, worked on the audio modality of MultiCogTrust: how the sound of a system shapes the way people come to trust it.',
  },
  {
    stop: 'nyu',
    period: '2026 — now',
    place: 'NYU x Hunter College',
    role: 'Co-technical lead, AI chatbot initiative',
    body: 'Co-leading the technical build of a chatbot that supports critical consciousness development for Asian American LGBTQ+ young adults, grounded in vetted source material rather than generic AI answers.',
  },
]


// Screenshots: drop an image in public/shots/ and set `shot: { src: 'shots/name.webp', alt: 'what it shows' }`.
// Leave `src` empty and no image is shown. Projects without `href` are shown as private work.
export const WORKS = [
  {
    label: 'research & ai systems',
    sub: 'machine learning · agents · data',
    items: [
      { no: '01', title: 'MultiCogTrust', tag: 'research · audio', body: 'Audio-modality research at TIER Lab. I designed a prosodic gate classifier that filters out neutral speech before it reaches the NLP emotion model, so a live audio pipeline stops spending compute on segments that carry no signal. I also caught and flagged a silent data corruption bug in the upstream feature extractor.', href: '' },
      { no: '02', title: 'NYU AI chatbot', tag: 'research · health', body: 'Co-technical lead on a RAG chatbot supporting critical consciousness development for Asian American LGBTQ+ young adults. I designed the safety architecture (two-stage crisis detection, grounding in a vetted knowledge base, non-identifiable logging per IRB protocol) and am building the FastAPI backend and React + TypeScript frontend.', href: '' },
      { no: '03', title: 'Project Aegis', tag: 'ai · clinical safety', body: 'Clinical decision support built on a multi-agent pipeline, where a rule-based engine makes every dosage decision so no LLM output reaches the patient layer directly. I led the backend architecture, including a deterministic guideline calculator and layered output validation.', href: '' },
      { no: '04', title: 'Jackie', tag: 'personal · agents', body: 'A personal AI assistant in Telegram that keeps my classes, research and applications in one place. Built on the Claude API and LangGraph, with model routing to keep costs low and prompt-injection guards to keep responses safe and on-task.', href: 'https://github.com/sher-prog/cirilla' },

    ],
  },
  {
    label: 'applied products',
    sub: 'full-stack · security · accessibility',
    items: [
      { no: '05', title: 'A Little Bit of Home', tag: 'web · design', body: 'A recipe site for the dishes I grew up on in Durban, built to grow into a community where people add recipes from their own countries. I designed it as a ruled recipe box with taped photos and handwritten notes, and built it with no dependencies and no build step: recipes are plain JSON files, so adding one never touches layout code. Every method step has tick boxes that remember progress, search filters as you type, and the server ships a strict Content-Security-Policy and refuses anything outside its public files.', shot: { src: 'shots/a-little-bit-of-home.webp', alt: 'The home page of A Little Bit of Home: a handwritten welcome note on ruled paper beside two taped photos of dishes.' }, href: 'https://github.com/sher-prog/a-little-bit-of-home' },
      { no: '06', title: 'SafeExit', featured: true, tag: 'safety · mobile', body: 'A discreet safety-planning app for people preparing to leave an abusive relationship, built with a TEARS Foundation pitch in mind. On the surface it is a working South African recipe app; a hidden gesture opens the real toolkit behind a PIN: an exit-plan checklist, a dated incident journal with photos and voice notes, a document vault and one-tap helplines. Everything is encrypted on the device (AES-256-GCM, key derived from the PIN) with no server or account, and the court-ready PDF evidence pack carries a SHA-256 fingerprint for every file. WCAG AA accessibility, in English, isiZulu, isiXhosa and Afrikaans.', shot: { src: 'shots/safeexit.webp', alt: 'SafeExit’s everyday-app cover: a South African recipe list and a recipe page, shown on two phone screens.' }, href: 'https://github.com/sher-prog/mzansi-safe-haven' },
    ],
  },
]

export const FOOTER = {
  heading: 'let’s build something.',
  note: 'Open to internships, research collaborations, and tech-for-good projects.',
  links: [
    { label: 'GitHub', href: 'https://github.com/sher-prog' },   
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shernice-chetty' },
    { label: 'Email', href: 'mailto:shernicechetty02@gmail.com' },
  ],
}
