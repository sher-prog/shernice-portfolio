// ─────────────────────────────────────────────────────────────
//  The two numbers you'll most likely tune. Everything else
//  (copy, links, projects) lives in content.js.
// ─────────────────────────────────────────────────────────────
export const CONFIG = {
  // Hard cap on camera zoom. 1.4 is safe for the 2400px layers on most screens.
  // Raise it only after checking the art still looks sharp at that size.
  maxZoom: 1.4,

  // Character height as a share of the viewport on desktop.
  rigHeightVh: 94,

  // Below this width the page switches to the simple mobile layout.
  desktopMin: 900,
}

// Where each "camera stop" looks, as fractions of the character image
// (fx = across, fy = down). `ty` (optional) is where on screen that point lands, as a share of viewport height. 0.36 is roughly the eyes, 0.53 the choker,
// 0.76 the puppy on the shirt.
export const STOPS = {
  hero:    { fx: 0.5,  fy: 0.5,  scale: 0.82, ty: 0.6 },
  origin:  { fx: 0.5,  fy: 0.38, scale: 1.25 },
  finance: { fx: 0.5,  fy: 0.53, scale: 1.3 },
  arrival: { fx: 0.42, fy: 0.62, scale: 1.3 },
  bmcc:    { fx: 0.5,  fy: 0.7,  scale: 1.35 },
  hunter:  { fx: 0.5,  fy: 0.76, scale: 1.4 },
  tier:    { fx: 0.5,  fy: 0.45, scale: 1.3 },
  nyu:     { fx: 0.5,  fy: 0.38, scale: 1.25 },
  works:   { fx: 0.5,  fy: 0.5,  scale: 0.72 },
  footer:  { fx: 0.5,  fy: 0.42, scale: 1.05 },
}
