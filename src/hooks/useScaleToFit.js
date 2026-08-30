import { useEffect, useState } from 'react'

const STAGE_WIDTH = 1440

// Uniformly scales the fixed 1440px stage down to fit narrower viewports so the
// exact Figma layout/spacing is preserved (never reflowed) on any screen size.
export default function useScaleToFit() {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const computeScale = () => {
      setScale(Math.min(1, window.innerWidth / STAGE_WIDTH))
    }

    computeScale()
    window.addEventListener('resize', computeScale)
    return () => window.removeEventListener('resize', computeScale)
  }, [])

  return scale
}
