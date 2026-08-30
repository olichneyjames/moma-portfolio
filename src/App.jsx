import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Hero from './sections/Hero.jsx'
import BeforeAfter from './sections/BeforeAfter.jsx'
import Problem from './sections/Problem.jsx'
import NextAndFooter, { FRAME_HEIGHT as FRAME_4_HEIGHT } from './sections/NextAndFooter.jsx'
import useScaleToFit from './hooks/useScaleToFit.js'

gsap.registerPlugin(ScrollTrigger)

const FRAME_HEIGHT = 1024
const STAGE_HEIGHT = FRAME_HEIGHT * 3 + FRAME_4_HEIGHT

export default function App() {
  const scale = useScaleToFit()
  const stageRef = useRef(null)

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
    }, stageRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [scale])

  return (
    <div className="stage-viewport" style={{ height: STAGE_HEIGHT * scale }}>
      <div className="stage" ref={stageRef} style={{ transform: `scale(${scale})` }}>
        <Hero />
        <BeforeAfter />
        <Problem />
        <NextAndFooter />
      </div>
    </div>
  )
}
