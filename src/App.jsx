import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Hero from './sections/Hero.jsx'
import BeforeAfter from './sections/BeforeAfter.jsx'
import Problem from './sections/Problem.jsx'
import NextAndFooter from './sections/NextAndFooter.jsx'

gsap.registerPlugin(ScrollTrigger)

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

  return (
    <div className="page" ref={pageRef}>
      <Hero />
      <BeforeAfter />
      <Problem />
      <NextAndFooter />
    </div>
  )
}
