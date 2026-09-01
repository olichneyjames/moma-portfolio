import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Hero from './sections/Hero.jsx'
import BeforeAfter from './sections/BeforeAfter.jsx'
import Problem from './sections/Problem.jsx'
import NextAndFooter from './sections/NextAndFooter.jsx'

gsap.registerPlugin(ScrollTrigger)

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

  useEffect(() => {
    const handleResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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
