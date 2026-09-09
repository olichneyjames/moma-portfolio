import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

import Hero from './sections/Hero.jsx'
import BeforeAfter from './sections/BeforeAfter.jsx'
import Problem from './sections/Problem.jsx'
import Insights from './sections/Insights.jsx'
import Solution1 from './sections/Solution1.jsx'
import Solution2 from './sections/Solution2.jsx'
import Results from './sections/Results.jsx'
import Reflection from './sections/Reflection.jsx'
import NextAndFooter from './sections/NextAndFooter.jsx'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

// Chrome's mandatory scroll-snap feels noticeably rougher than Safari's —
// Safari ties snap into macOS's native inertial scrolling, so a flick's
// momentum decays and settles into a section as one continuous motion;
// Chrome's compositor-driven smooth-scroll has no such tie, so native snap
// there either fights an in-progress scroll or, once disabled, does nothing
// at all. Several hand-rolled JS approximations were tried for wheel input
// specifically — forcing scroll into discrete counted steps with a lock
// spanning the whole landing (read as a "forced slideshow"), then a version
// where the lock was shorter than the landing so a second flick could
// interrupt it (which meant a single flick's own momentum tail, being
// indistinguishable from a second deliberate flick, could sneak through and
// get counted as one) — each fixing one problem while reintroducing the
// other, because neither version looked at *how* a wheel event related to
// the one before it, only at time elapsed. The actual fix, adapted from a
// small open-source library built for exactly this
// (https://github.com/LinardsLiepenieks/react-scroll-snap-momentum):
// classify each wheel event individually — fast timing + same direction +
// non-increasing delta vs. the previous event reads as "still the same
// momentum tail", anything else reads as "a fresh, intentional push" — and
// give momentum-classified events a long cooldown before the next section
// change is allowed, but intentional-looking ones a short one. See the
// comment on the wheel effect below for the full mechanics. A lone mouse
// wheel notch and a deliberate second trackpad flick both naturally read as
// "intentional" under this test (neither has a decaying predecessor to
// compare against), so this one algorithm handles both input types
// correctly without needing to separately detect which device sent it —
// there's no reliable browser API for that anyway.
//
// Touch is a different problem: once you lift your finger, the native
// "fling" that follows is animated entirely by the OS/browser compositor
// with no further touch events at all, so there's no stream to classify the
// way there is with wheel events — it's a black box while in flight. So
// touch instead keeps native scrolling (real fling, completely untouched)
// and only uses GSAP ScrollTrigger's own built-in `snap` feature to ease
// into the nearest section once it settles — see the comment on the touch
// effect below.
//
// There's no CSS feature query that tells Chrome and Safari apart (both
// support the same snap properties), so this is a plain UA sniff: Chrome
// gets native snap turned off (see the
// `@media (pointer: fine) { html.is-chromium { scroll-snap-type: none } }`
// rule in index.css) in favor of the controllers below. Safari keeps the
// native CSS snap entirely untouched.
const ua = navigator.userAgent
const isChromium = /Chrome|Chromium/.test(ua) && !/Edg|OPR/.test(ua)
document.documentElement.classList.toggle('is-chromium', isChromium)

// Gated on having a mouse/trackpad, not a width breakpoint: wheel events
// (and this whole problem) require one, and a resized-narrow desktop Chrome
// window has one just as much as a full-width one — someone previewing the
// tablet/mobile CSS tiers by shrinking their own browser window is still
// scrolling with a trackpad, not a finger.
const FINE_POINTER_QUERY = '(pointer: fine)'
// A real touchscreen phone/tablet never fires wheel events at all, so the
// wheel controller above stays inert there regardless of width — this is
// its own separate query (not just "not fine") so a device with neither
// (rare, but possible) doesn't accidentally match either.
const COARSE_POINTER_QUERY = '(pointer: coarse)'

// One page-stop per top-level `.section`, aligned start/center/end to
// mirror the same CSS rule each section uses natively in index.css —
// including the width thresholds at which those rules themselves change
// (`.section--body`'s `center` align only exists at >=1024px, where the
// whitespace is meant to sandwich the content above and below; `end` for
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

  // Chrome + touch (pointer: coarse): native scroll (real OS fling,
  // completely untouched) plus GSAP ScrollTrigger's own built-in `snap` to
  // ease into the nearest section once it settles — see the comment block
  // above for why touch gets this instead of the wheel controller below.
  // Re-evaluated whenever the pointer query flips so control hands back to
  // native CSS snap cleanly (e.g. this same Chrome instance later opened on
  // a device with a mouse instead).
  useEffect(() => {
    if (!isChromium) return

    const mediaQuery = window.matchMedia(COARSE_POINTER_QUERY)
    let trigger = null

    const setup = () => {
      // No wrapper, no touch listener, no custom physics — this is a plain
      // ScrollTrigger spanning the whole scrollable page, whose only job is
      // its own `snap` config. `end` as a function (not a fixed number) so
      // ScrollTrigger's own refresh-on-resize keeps it correct as content
      // reflows. Everything about *how scrolling feels* while it's actually
      // moving is just the browser's real native fling — untouched.
      trigger = ScrollTrigger.create({
        start: 0,
        end: () => document.documentElement.scrollHeight - window.innerHeight,

        snap: {
          // snapTo gets ScrollTrigger's own current progress (0-1) and
          // returns the progress to snap to — translate to/from pixels
          // ourselves since our stops (getSectionTargets) aren't evenly
          // spaced. Recomputed on every call rather than cached, so it's
          // always right after a resize or a layout shift (e.g. an image
          // finishing loading).
          snapTo: (progress) => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight
            if (maxScroll <= 0) return progress
            const scroll = progress * maxScroll
            const targets = getSectionTargets()
            let nearest = targets[0] ?? 0
            let nearestDistance = Infinity
            targets.forEach((value) => {
              const distance = Math.abs(value - scroll)
              if (distance < nearestDistance) {
                nearestDistance = distance
                nearest = value
              }
            })
            return nearest / maxScroll
          },
          // Velocity-scaled: a barely-moving stop lands quickly, a fast
          // flick gets more time to ease down rather than snapping abruptly
          // out of real momentum.
          duration: { min: 0.35, max: 0.9 },
          // How long to wait after scrolling stops before easing in — long
          // enough that it never reads as cutting a swipe's momentum tail
          // short. Cancels and restarts automatically if you scroll again
          // before it fires (ScrollTrigger's own behavior, not something
          // handled here).
          delay: 0.15,
          ease: 'power2.out',
        },
      })
    }

    const teardown = () => {
      trigger?.kill()
      trigger = null
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

  // Chrome + mouse/trackpad (pointer: fine): one section per wheel gesture,
  // with a slow, deliberate landing — the momentum-classification algorithm
  // from the comment block above, adapted from
  // https://github.com/LinardsLiepenieks/react-scroll-snap-momentum.
  //
  // Every wheel event is classified individually against the one before it:
  // fast timing (less than MOMENTUM_GAP_MS since the last event), the same
  // direction as that last event, and a delta that hasn't grown — all three
  // together mean "this is still the same physical gesture's decaying
  // momentum tail", not a fresh push. A momentum-classified event has to
  // wait out MOMENTUM_COOLDOWN_MS since the last section change before it's
  // allowed to trigger another one (long enough to reliably outlast a real
  // trackpad momentum tail); an intentional-looking one only has to wait out
  // the much shorter NORMAL_COOLDOWN_MS. A lone mouse notch and a genuinely
  // separate second flick both read as "intentional" under this test (there
  // being no decaying predecessor to compare against right after a pause),
  // so both get the short cooldown — this is what lets "flick, flick, flick"
  // chain through pages while a single hard flick's own tail still can't.
  useEffect(() => {
    if (!isChromium) return

    const mediaQuery = window.matchMedia(FINE_POINTER_QUERY)
    let onWheel = null

    const MOMENTUM_GAP_MS = 1500
    const MIN_DELTA = 4 // filters trackpad noise / micro-movements
    const NORMAL_COOLDOWN_MS = 550
    const MOMENTUM_COOLDOWN_MS = 1300
    // "Sink into the next page": slow and heavily eased, not snappy.
    const LAND_DURATION = 0.55
    // "Pulse" — Michael Herf's easing curve from the classic SmoothScroll
    // Chrome extension (https://github.com/gblazex/smoothscroll,
    // http://stereopsis.com/stopping/): a fixed-force acceleration phase
    // for the first 1/pulseScale of the curve, then a viscous exponential
    // drag for the rest — tuned by ear, over years, in a 150,000-user
    // extension, specifically for what a wheel-driven scroll deceleration
    // should feel like, rather than a generic UI-transition curve like
    // power2/power3. pulseScale controls how much of the curve is the
    // initial push vs. the drag; normalized so the curve always lands
    // exactly on 1 at t=1 regardless of that scale.
    const PULSE_SCALE = 4
    const pulseRaw = (t) => {
      const x = t * PULSE_SCALE
      if (x < 1) return x - (1 - Math.exp(-x))
      const start = Math.exp(-1)
      const tail = 1 - Math.exp(-(x - 1))
      return start + tail * (1 - start)
    }
    const pulseNormalize = 1 / pulseRaw(1)
    const landEase = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : pulseRaw(t) * pulseNormalize)

    let lastEventDelta = 0
    let lastEventDirection = 0
    let lastEventAt = 0
    let lastStepAt = 0
    let isLanding = false

    const setup = () => {
      onWheel = (event) => {
        event.preventDefault() // we own scrolling entirely here, same as every version before

        const now = performance.now()
        const delta = Math.abs(event.deltaY)
        const direction = Math.sign(event.deltaY)
        if (delta < MIN_DELTA) return

        const gapMs = now - lastEventAt
        const isMomentum =
          lastEventDirection !== 0 &&
          gapMs < MOMENTUM_GAP_MS &&
          direction === lastEventDirection &&
          delta <= lastEventDelta

        lastEventDelta = delta
        lastEventDirection = direction
        lastEventAt = now

        if (isLanding) return
        const cooldown = isMomentum ? MOMENTUM_COOLDOWN_MS : NORMAL_COOLDOWN_MS
        if (now - lastStepAt < cooldown) return

        const targets = getSectionTargets()
        const current = window.scrollY
        let currentIndex = 0
        let currentDistance = Infinity
        targets.forEach((value, index) => {
          const distance = Math.abs(value - current)
          if (distance < currentDistance) {
            currentDistance = distance
            currentIndex = index
          }
        })
        const nextIndex = Math.max(0, Math.min(currentIndex + direction, targets.length - 1))
        if (nextIndex === currentIndex && currentDistance < 2) return

        lastStepAt = now
        isLanding = true
        gsap.to(window, {
          scrollTo: { y: targets[nextIndex] },
          duration: LAND_DURATION,
          ease: landEase,
          onComplete: () => {
            isLanding = false
          },
        })
      }
      window.addEventListener('wheel', onWheel, { passive: false })
    }

    const teardown = () => {
      if (onWheel) window.removeEventListener('wheel', onWheel)
      onWheel = null
      isLanding = false
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
