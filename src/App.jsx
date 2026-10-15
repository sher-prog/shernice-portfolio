import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { CONFIG } from './config.js'
import { HERO, TIMELINE, WORKS, FOOTER } from './content.js'
import { setupCamera } from './camera.js'
import { loadAssets, createCharacter } from './character3d.js'

gsap.registerPlugin(ScrollTrigger)

// Only render links with a known-safe scheme, so a typo or a future pasted value
// (e.g. javascript:) in content.js can never become a clickable script.
const SAFE_SCHEMES = ['https:', 'http:', 'mailto:']
function safeHref(href) {
  try {
    return SAFE_SCHEMES.includes(new URL(href, window.location.href).protocol) ? href : ''
  } catch {
    return ''
  }
}
const isWeb = (href) => /^https?:/i.test(href)

export default function App() {
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState(0)
  const rig = useRef(null)
  const canvas = useRef(null)
  const character = useRef(null)
  const [flat, setFlat] = useState(false)
  const hero = useRef(null)
  const timeline = useRef(null)
  const works = useRef(null)
  const track = useRef(null)
  const footer = useRef(null)
  const topbar = useRef(null)

  // Load every texture, build the 3D character, then reveal the page.
  useEffect(() => {
    let cancelled = false
    const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Never leave visitors on the spinner: reveal the page after 10s even if an asset hangs.
    const guard = setTimeout(() => !cancelled && setReady(true), 10000)
    loadAssets((p) => !cancelled && setProgress(p))
      .then((imgs) => {
        if (cancelled) return
        let c = null
        try {
          c = createCharacter(canvas.current, imgs, { motion })
        } catch (e) {
          console.warn('[portfolio] 3D character failed, using the flat image', e)
        }
        if (!c) setFlat(true)
        else c.onLost = () => setFlat(true)
        character.current = c
      })
      .catch(() => !cancelled && setFlat(true))
      .finally(() => setTimeout(() => !cancelled && setReady(true), 250))
    return () => {
      cancelled = true
      clearTimeout(guard)
      character.current?.destroy()
      character.current = null
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    const mm = gsap.matchMedia()
    mm.add(
      {
        full: `(min-width: ${CONFIG.desktopMin}px) and (prefers-reduced-motion: no-preference)`,
        simple: `(max-width: ${CONFIG.desktopMin - 1}px), (prefers-reduced-motion: reduce)`,
      },
      (context) => {
        const { full } = context.conditions
        document.documentElement.classList.toggle('simple', !full)
        if (!full) {
          // Simple layout: the character is vivid on the first screen, then recedes behind the text.
          const stage = document.querySelector('.stage')
          const onScroll = () => {
            const t = Math.min(1, window.scrollY / (window.innerHeight * 0.6))
            stage.style.opacity = String(1 - 0.78 * t)
          }
          onScroll()
          window.addEventListener('scroll', onScroll, { passive: true })
          return () => {
            window.removeEventListener('scroll', onScroll)
            stage.style.opacity = ''
          }
        }
        // Nav switches to light ink while the dark projects section is under it.
        const onDark = () => {
          const r = works.current.getBoundingClientRect()
          topbar.current.classList.toggle('on-dark', r.top <= 40 && r.bottom > 40)
        }
        window.addEventListener('scroll', onDark, { passive: true })
        onDark()
        const lenis = new Lenis({ lerp: 0.1, anchors: true })
        lenis.on('scroll', ScrollTrigger.update)
        const tick = (t) => lenis.raf(t * 1000)
        gsap.ticker.add(tick)
        gsap.ticker.lagSmoothing(0)
        const cleanup = setupCamera({
          rig: rig.current,
          character: character.current,
          hero: hero.current,
          entries: Array.from(timeline.current.querySelectorAll('.entry')),
          works: works.current,
          track: track.current,
          footer: footer.current,
          timeline: timeline.current,
        })
        // Tabbing to a card that is scrolled off-screen would make the browser scroll the
        // clipped viewport sideways and fight the pinned animation. Reset that and scroll the
        // page to the matching point instead.
        const viewport = works.current.querySelector('.works-viewport')
        const onFocusIn = (e) => {
          const card = e.target.closest?.('.work')
          if (!card) return
          viewport.scrollLeft = 0
          const st = ScrollTrigger.getAll().find((x) => x.pin === works.current)
          if (!st) return
          const dist = Math.max(1, track.current.scrollWidth - viewport.clientWidth)
          const x = card.getBoundingClientRect().left - track.current.getBoundingClientRect().left
          const p = Math.min(1, Math.max(0, (x - 80) / dist))
          lenis.scrollTo(st.start + p * (st.end - st.start), { immediate: true })
        }
        works.current.addEventListener('focusin', onFocusIn)
        const t = setTimeout(() => ScrollTrigger.refresh(), 300)
        return () => {
          works.current?.removeEventListener('focusin', onFocusIn)
          window.removeEventListener('scroll', onDark)
          topbar.current?.classList.remove('on-dark')
          clearTimeout(t)
          cleanup()
          gsap.ticker.remove(tick)
          lenis.destroy()
        }
      },
    )
    return () => mm.revert()
  }, [ready])

  return (
    <>
      <div className={'loader' + (ready ? ' is-hidden' : '')} role="status" aria-label="Loading" aria-hidden={ready}>
        <div className="loader-ring">
          <svg viewBox="0 0 100 100">
            <circle className="lr-track" cx="50" cy="50" r="44" />
            <circle
              className="lr-arc"
              cx="50"
              cy="50"
              r="44"
              style={{ strokeDasharray: 276.5, strokeDashoffset: 276.5 * (1 - progress) }}
            />
          </svg>
        </div>
      </div>

      <header className="topbar" ref={topbar}>
        <a className="brand" href="#top">shernice’s portfolio</a>
        <nav aria-label="Sections">
          <a href="#path">path</a>
          <a href="#projects">projects</a>
          <a href="#connect"><span className="nav-long">let’s </span>connect</a>
        </nav>
      </header>

      {/* Fixed character: a WebGL canvas (depth-displaced layers + moving eyes) inside one camera rig. */}
      <div className="stage" style={{ '--rig-h': `${CONFIG.rigHeightVh}vh` }} aria-hidden="true">
        <div className="rig" ref={rig}>
          {flat ? (
            <img className="char-flat" src="layers/flat.webp" alt="" draggable="false" />
          ) : (
            <canvas className="char-canvas" ref={canvas} />
          )}
        </div>
      </div>

      <main id="top">
        <section className="hero" ref={hero}>
          <h1 className="hero-name">{HERO.name}</h1>
          <div className="hero-foot above">
            <p className="hero-tag">{HERO.tagline}</p>
            <p className="hero-thesis">{HERO.thesis}</p>
          </div>
          <div className="scroll-cue above" aria-hidden="true">
            <span>scroll</span>
            <i />
          </div>
        </section>

        <section className="timeline above" id="path" ref={timeline}>
          <h2 className="section-title">the path so far</h2>
          {TIMELINE.map((e, i) => (
            <article className="entry" data-stop={e.stop} key={i}>
              <div className="entry-card">
                <p className="entry-period">{e.period}</p>
                <h3 className="entry-place">{e.place}</h3>
                <p className="entry-role">{e.role}</p>
                <p className="entry-body">{e.body}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="works above" id="projects" ref={works}>
          <h2 className="section-title works-title">projects</h2>
          <div className="works-viewport">
          <div className="works-track" ref={track}>
            {WORKS.map((g) => (
              <div className="work-group" key={g.label}>
                <div className="group-head">
                  <h3 className="group-label">{g.label}</h3>
                  <p className="group-sub">{g.sub}</p>
                </div>
                {g.items.map((w) => (
                  <article className={'work' + (w.featured ? ' is-featured' : '') + (w.shot?.src ? ' has-shot' : '')} key={w.no}>
                    <div className="work-main">
                    <span className="work-no">{w.no}</span>
                    <h3 className="work-title">{w.title}</h3>
                    <p className="work-tag">{w.tag}</p>
                    <p className="work-body">{w.body}</p>
                    {safeHref(w.href) || safeHref(w.live) ? (
                      <div className="work-links">
                        {safeHref(w.live) ? (
                          <a className="work-link" href={w.live} target="_blank" rel="noopener noreferrer" aria-label={`${w.title} live site (opens in a new tab)`}>live site →</a>
                        ) : null}
                        {safeHref(w.href) ? (
                          <a className="work-link" href={w.href} target="_blank" rel="noopener noreferrer" aria-label={`${w.title} code on GitHub (opens in a new tab)`}>{w.live ? 'code →' : 'view →'}</a>
                        ) : null}
                      </div>
                    ) : (
                      <p className="work-note">Private work · code not public</p>
                    )}
                    </div>
                    {w.shot?.src ? (
                      <img className="work-shot" src={w.shot.src} alt={w.shot.alt} loading="lazy" />
                    ) : null}
                  </article>
                ))}
              </div>
            ))}
          </div>
          </div>
        </section>

        <section className="footer above" id="connect" ref={footer}>
          <h2 className="footer-heading">{FOOTER.heading}</h2>
          <p className="footer-note">{FOOTER.note}</p>
          <ul className="footer-links">
            {FOOTER.links.map((l) => (
              <li key={l.label}>
                {safeHref(l.href) ? (
                  <a href={l.href} {...(isWeb(l.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{l.label}</a>
                ) : (
                  <span className="is-todo">{l.label}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  )
}
