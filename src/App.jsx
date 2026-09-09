import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import Hero from './sections/Hero.jsx'
import BeforeAfter from './sections/BeforeAfter.jsx'
import Problem from './sections/Problem.jsx'
import Insights from './sections/Insights.jsx'
import Solution1 from './sections/Solution1.jsx'
import Solution2 from './sections/Solution2.jsx'
import Results from './sections/Results.jsx'
import Reflection from './sections/Reflection.jsx'
import NextAndFooter from './sections/NextAndFooter.jsx'

gsap.registerPlugin(ScrollTrigger)

// Chrome's mandatory scroll-snap feels noticeably rougher than Safari's —
// Safari ties snap into macOS's native inertial scrolling, so a flick's
// momentum can never overshoot past a snap point; Chrome's compositor-driven
// smooth-scroll has no such tie, so a strong flick (or its OS-synthesized
// momentum tail) just glides straight through every section. Nothing in
// native CSS scroll-snap resolves this (proximity, dropping
// scroll-snap-stop, a homegrown JS wheel/scrollend approximation, and the
// Lenis library's own Snap plugin were all tried and all still let a single
// flick blow through multiple sections — see the comment on the effect
// below for exactly why). The actual fix is Lenis
// (https://github.com/darkroomengineering/lenis) as the *only* thing
// driving scroll, animating exactly one section per wheel gesture ourselves.
// There's no CSS feature query that tells Chrome and Safari apart (both
// support the same snap properties), so this is a plain UA sniff: Chrome
// gets native snap turned off (see the
// `@media (pointer: fine) { html.is-chromium { scroll-snap-type: none } }`
// rule in index.css) in favor of the Lenis-driven paginator below. Safari
// keeps the native CSS snap entirely untouched.
const ua = navigator.userAgent
const isChromium = /Chrome|Chromium/.test(ua) && !/Edg|OPR/.test(ua)
document.documentElement.classList.toggle('is-chromium', isChromium)

// Gated on having a mouse/trackpad, not a width breakpoint: wheel events
// (and this whole problem) require one, and a resized-narrow desktop Chrome
// window has one just as much as a full-width one — someone previewing the
// tablet/mobile CSS tiers by shrinking their own browser window is still
// scrolling with a trackpad, not a finger. A real touchscreen phone/tablet
// (`pointer: coarse`) never fires wheel events at all regardless of width,
// so this stays inert there and native mandatory-snap (tuned separately
// for touch momentum in index.css) is untouched.
const FINE_POINTER_QUERY = '(pointer: fine)'

// One page-stop per top-level `.section`, aligned start/center/end to
// mirror the same CSS rule each section uses natively in index.css —
// including the width thresholds at which those rules themselves change
// (`.section--body`'s `center` align only exists at >=1024px; `end` for
// data-frame 4 only exists at >=768px), since this runs at whatever width
// the browser window currently is, not just desktop. (An earlier version
// also added the hero image's own bottom edge as an extra stop, mirroring
// a snap point that exists in the CSS — but that turned a single "next
// page" step at the very top of the page into a jump to that in-between
// point instead of the actual next section, which is what made the very
// first scroll gesture look broken. Pagination only cares about whole
// sections, so it's deliberately left out here.)
function getSectionTargets() {
  const viewportHeight = window.innerHeight
  const width = window.innerWidth
  return Array.from(document.querySelectorAll('.section')).map((el) => {
    let align = 'start'
    if (el.classList.contains('section--body') && width >= 1024) align = 'center'
    else if (el.dataset.frame === '4' && width >= 768) align = 'end'

    const top = el.getBoundingClientRect().top + window.scrollY
    if (align === 'center') return top + el.offsetHeight / 2 - viewportHeight / 2
    if (align === 'end') return top + el.offsetHeight - viewportHeight
    return top
  })
}

// Mobile browsers fire `resize` constantly during scroll — the address
// bar collapsing/expanding changes window.innerHeight without any real
// layout change. Without this, the manual refresh below (and
// ScrollTrigger's own internal resize handling) would recalculate every
// trigger's start/end position mid-scroll, which is what was causing
// scroll to visibly hitch or stop on phones. This tells ScrollTrigger to
// ignore resize events that are just a height change on touch devices.
ScrollTrigger.config({ ignoreMobileResize: true })

export default function App() {
  const pageRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reveals = gsap.utils.toArray('.reveal')
      reveals.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 48 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      })

      // Parallax: image placeholders drift a little slower than the page scroll,
      // scrubbed continuously to scroll position (not a one-shot reveal) so they
      // read as sitting slightly "behind" the surrounding text.
      //
      // The CSS gap above/below each image (row-gap, stack-gap) is set to match
      // the Figma reference exactly, and that reference value is meant to be
      // the *midpoint* of this animation, not just its resting state. Since
      // scrub interpolates linearly between symmetric ±8% offsets, yPercent
      // passes through 0 (no offset — the CSS gap applies untouched) exactly
      // halfway through the scroll, landing the reference spacing at the
      // midpoint automatically — true for either direction below, since
      // reversing which end is +8 vs -8 doesn't change where the midpoint
      // falls, only which way the image drifts. Kept at -8 → +8 (narrower
      // gap at the start of the scroll, wider at the end) because that's
      // what makes it read as "slower than the page" per the comment above:
      // as you scroll down, the growing +yPercent partially cancels the
      // image's own upward scroll motion, so it lags behind the text — the
      // classic background-parallax feel. Reversing it would make the image
      // drift faster than the scroll instead, a foreground-style effect.
      const parallaxEls = gsap.utils.toArray('.parallax')
      parallaxEls.forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: el.closest('.frame'),
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          },
        )
      })
    }, pageRef)

    return () => ctx.revert()
  }, [])

  // Chrome wheel-driven paginated scroll (see the comment block above).
  // Scoped to `isChromium && matches(FINE_POINTER_QUERY)`, and re-evaluated
  // whenever that flips — e.g. a Bluetooth trackpad connecting/disconnecting
  // mid-session — so control hands back to native CSS snap cleanly.
  useEffect(() => {
    if (!isChromium) return

    const mediaQuery = window.matchMedia(FINE_POINTER_QUERY)
    let lenis = null
    let onLenisScroll = null
    let onTick = null
    let onWheelCapture = null
    let onResize = null

    // Why lerp/wheelMultiplier tuning, and then the Lenis Snap plugin,
    // both failed to fix this: Lenis's own core loop follows *every* wheel
    // event's delta in real time (`onVirtualScroll` calls
    // `scrollTo(targetScroll + delta, ...)` on each one). The Snap plugin
    // only does a single corrective "snap to nearest" jump *after* the
    // whole wheel/momentum stream has gone idle — so no matter how heavily
    // damped that per-event follow was, a single flick's full momentum
    // tail (which macOS/Chrome keeps synthesizing for a second or more
    // after you lift your fingers) was always free to keep accumulating
    // and carry the real scroll position through many sections before Snap
    // ever got a chance to intervene. A later attempt drove `snap.next()`/
    // `previous()` directly off our own wheel handler instead of Snap's own
    // debounced trigger, which fixed *that* problem — but Snap's own point
    // list also includes an extra stop for the hero image's bottom edge
    // (mirroring a real snap point in the CSS), so the very first "next
    // page" step from the top landed on that in-between point instead of
    // the actual next section, which is what made it look broken.
    //
    // This version fixes both: wheel input never drives scroll position
    // directly (every event is neutralized — deltaY forced to 0, native
    // scroll prevented — before Lenis ever sees it), and the only stops are
    // the actual top-level `.section` elements (`getSectionTargets`, no
    // extra in-between points). A wheel nudge past WHEEL_THRESHOLD moves
    // exactly one section via Lenis's normal eased `scrollTo`; while that's
    // in flight (`isStepLocked`), every further wheel event — including a
    // flick's entire decaying momentum tail — is discarded outright, so one
    // continuous gesture can only ever complete one section transition.
    // Lifting your fingers and pushing again (or just continuing to scroll
    // once the lock clears) fires the next step, so working through several
    // sections via sustained/repeated input still reads as "quick".
    const WHEEL_THRESHOLD = 12
    const WHEEL_IDLE_MS = 150
    const STEP_DURATION = 1.1
    const stepEasing = (t) => 1 - Math.pow(1 - t, 4)
    let wheelAccum = 0
    let idleTimer = null
    let isStepLocked = false
    let currentIndex = 0

    const nearestIndex = (targets, scroll) => {
      let nearest = 0
      let nearestDistance = Infinity
      targets.forEach((value, index) => {
        const distance = Math.abs(value - scroll)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearest = index
        }
      })
      return nearest
    }

    const step = (direction) => {
      const targets = getSectionTargets()
      const nextIndex = Math.max(0, Math.min(currentIndex + direction, targets.length - 1))
      if (nextIndex === currentIndex) return
      currentIndex = nextIndex
      isStepLocked = true
      lenis.scrollTo(targets[nextIndex], {
        duration: STEP_DURATION,
        easing: stepEasing,
        lock: true,
        onComplete: () => {
          isStepLocked = false
        },
      })
    }

    const setup = () => {
      lenis = new Lenis()
      currentIndex = nearestIndex(getSectionTargets(), window.scrollY)

      onLenisScroll = () => {
        ScrollTrigger.update()
        // Resync if the page moved by some means other than our own wheel
        // handler (scrollbar drag, keyboard PageDown/End) so the next
        // wheel-driven step still moves from the section actually on screen.
        if (!isStepLocked) currentIndex = nearestIndex(getSectionTargets(), lenis.scroll)
      }
      lenis.on('scroll', onLenisScroll)

      onTick = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(onTick)
      gsap.ticker.lagSmoothing(0)

      onWheelCapture = (event) => {
        // We fully own wheel-driven scrolling now — always suppress the
        // browser's native scroll, and always neutralize the event for
        // Lenis's own listener downstream (bubble phase), whether or not
        // this particular event ends up triggering a step. Read the raw
        // value first — the override below replaces it for everyone else.
        const rawDeltaY = event.deltaY
        event.preventDefault()
        Object.defineProperty(event, 'deltaY', { value: 0, configurable: true })

        if (isStepLocked) return // discard the rest of this flick's momentum tail

        wheelAccum += rawDeltaY
        clearTimeout(idleTimer)
        idleTimer = setTimeout(() => {
          wheelAccum = 0
        }, WHEEL_IDLE_MS)

        if (Math.abs(wheelAccum) > WHEEL_THRESHOLD) {
          const direction = wheelAccum > 0 ? 1 : -1
          wheelAccum = 0
          step(direction)
        }
      }
      window.addEventListener('wheel', onWheelCapture, { capture: true, passive: false })

      // Keep our notion of "current section" in sync with wherever the page
      // actually is if it moves by some means other than our own wheel
      // handler (scrollbar drag, keyboard PageDown/End) — a resize can also
      // shift where each section's target lands.
      onResize = () => {
        if (!isStepLocked) currentIndex = nearestIndex(getSectionTargets(), window.scrollY)
      }
      window.addEventListener('resize', onResize)
    }

    const teardown = () => {
      if (onWheelCapture) window.removeEventListener('wheel', onWheelCapture, { capture: true })
      if (onResize) window.removeEventListener('resize', onResize)
      clearTimeout(idleTimer)
      wheelAccum = 0
      isStepLocked = false
      if (onTick) gsap.ticker.remove(onTick)
      if (lenis && onLenisScroll) lenis.off('scroll', onLenisScroll)
      lenis?.destroy()
      lenis = null
    }

    const sync = () => {
      teardown()
      if (mediaQuery.matches) setup()
    }

    sync()
    mediaQuery.addEventListener('change', sync)
    return () => {
      mediaQuery.removeEventListener('change', sync)
      teardown()
    }
  }, [])

  return (
    <div className="page" ref={pageRef}>
      <Hero />
      <BeforeAfter />
      <Problem />
      <Insights />
      <Solution1 />
      <Solution2 />
      <Results />
      <Reflection />
      <NextAndFooter />
    </div>
  )
}
