import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CONFIG, STOPS } from './config.js'

gsap.registerPlugin(ScrollTrigger)

// Image aspect (width / height) of the character layers.
const ASPECT = 3584 / 4800

// Work out the rig transform that puts the point (fx, fy) of the character
// at a chosen screen position, at a chosen zoom.
function stateFor(stopName, where = 'left') {
  const stop = STOPS[stopName] ?? STOPS.hero // a mistyped `stop` in content.js must not blank the page
  const vw = window.innerWidth
  const vh = window.innerHeight
  const Rh = (vh * CONFIG.rigHeightVh) / 100
  const Rw = Rh * ASPECT
  const scale = Math.min(stop.scale, CONFIG.maxZoom)
  const cx = vw / 2
  const top0 = (vh - Rh) / 2
  const tx = where === 'center' ? vw * 0.5 : where === 'works' ? vw * 0.2 : vw * 0.29
  const ty = vh * (stop.ty ?? 0.5)
  const px = (stop.fx - 0.5) * Rw
  const py = stop.fy * Rh
  let y = ty - top0 - py * scale
  // Never let the straight bottom edge of the illustration show: keep it at or below the viewport bottom.
  y = Math.max(y, vh - top0 - Rh * scale)
  return { x: tx - cx - px * scale, y, scale }
}

export function setupCamera({ rig, character, hero, entries, works, track, footer }) {
  const ctx = gsap.context(() => {
    gsap.set(rig, { transformOrigin: '50% 0%' })
    const first = stateFor('hero', 'center')
    gsap.set(rig, { x: first.x, y: first.y, scale: first.scale })

    // One scrubbed move between two camera stops.
    const move = (fromStop, fromWhere, toStop, toWhere, trigger, start, end) => {
      gsap.fromTo(
        rig,
        {
          x: () => stateFor(fromStop, fromWhere).x,
          y: () => stateFor(fromStop, fromWhere).y,
          scale: () => stateFor(fromStop, fromWhere).scale,
        },
        {
          x: () => stateFor(toStop, toWhere).x,
          y: () => stateFor(toStop, toWhere).y,
          scale: () => stateFor(toStop, toWhere).scale,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger, start, end, scrub: 0.6, invalidateOnRefresh: true },
        },
      )
    }

    // The horizontal gallery pins first, so later triggers measure after its spacer.
    const trackDistance = () => Math.max(0, track.scrollWidth - track.parentElement.clientWidth)
    gsap.to(track, {
      x: () => -trackDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: works,
        start: 'top top',
        end: () => '+=' + trackDistance(),
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
      },
    })

    // hero -> first timeline stop
    const stops = entries.map((el) => el.dataset.stop)
    move('hero', 'center', stops[0], 'left', hero, 'top top', 'bottom top')
    // between timeline stops
    for (let i = 1; i < stops.length; i++) {
      move(stops[i - 1], 'left', stops[i], 'left', entries[i], 'top bottom', 'top 40%')
    }
    // timeline -> works -> footer
    move(stops[stops.length - 1], 'left', 'works', 'works', works, 'top bottom', 'top top')
    move('works', 'works', 'footer', 'left', footer, 'top bottom', 'top 30%')

    // Scroll nudges the head a few degrees; the pointer is handled inside character3d.
    ScrollTrigger.create({
      trigger: document.body,
      start: 0,
      end: 'max',
      onUpdate: (self) => character?.setScroll(Math.sin(self.progress * Math.PI * 10)),
    })
  })
  return () => {
    ctx.revert()
  }
}
