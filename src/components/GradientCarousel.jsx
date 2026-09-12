import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// Infinite 3D carousel, contained to its own box (not the viewport) and
// driven only by drag/touch/click — never by wheel, so it can never fight
// the page's own wheel-based section scroller (see App.jsx). Adapted from
// the mechanic in https://github.com/clementgrellier/gradientslider (MIT).

const FRICTION = 0.92
const DRAG_SENS = 1.35
const CLICK_MAX_MOVEMENT = 6 // px of pointer travel below which a tap counts as a click, not a drag
// Momentum decays exponentially (FRICTION per frame), so raising this
// threshold shaves a CONSTANT amount off the wait before snapping regardless
// of flick strength. Tuned live via a temporary slider panel (90, up from
// the original 10) for a snappier, less-coasty settle.
const SNAP_VELOCITY_THRESHOLD = 90
const SNAP_TWEEN_DURATION = 0.8 // seconds; tuned live via a temporary slider panel (was 0.5)

// Pin sizing — matches the ratios in the Figma "carousel pins" reference
// (inactive:active width 50:100 = 1:2, height a bit taller than inactive
// width, gap about 0.4x inactive width) at a small real-UI scale. Height
// never changes; only width does. (3/4 of the original 16/14/28/6.)
const PIN_HEIGHT = 12
const PIN_BASE_WIDTH = 10.5
const PIN_ACTIVE_WIDTH = 21
const PIN_GAP = 4.5
const PIN_INACTIVE_COLOR = '#ffffff'

function mod(n, m) {
  return ((n % m) + m) % m
}

function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return [h * 60, s, l]
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360
  if (s === 0) {
    const v = Math.round(l * 255)
    return [v, v, v]
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ]
}

function fallbackPalette(index) {
  const hue = (index * 47) % 360
  return { c1: hslToRgb(hue, 0.85, 0.5), c2: hslToRgb(hue, 0.8, 0.6) }
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)]
}

// Gradient sourced directly from the slide's own pin color instead of
// sampling the image — c1 is that color as-is (it's already a deliberately
// chosen brand color, not something that needs re-extracting), c2 is a
// lighter tint of the same hue so the two radial blobs still read as one
// coherent glow rather than two unrelated stops.
function paletteFromPinColor(hex) {
  const [r, g, b] = hexToRgb(hex)
  const [h, s] = rgbToHsl(r, g, b)
  return { c1: [r, g, b], c2: hslToRgb(h, Math.max(0.4, s * 0.85), 0.72) }
}

// Downsamples the image onto an offscreen canvas and buckets pixels into
// 12 hue bins (weighted toward mid-saturation, mid-lightness pixels) to
// find a dominant color, then a second, distinctly-different-hue color for
// the gradient's two stops.
function extractPalette(img, index) {
  try {
    const MAX = 36
    const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1
    const w = ratio >= 1 ? MAX : Math.max(12, Math.round(MAX * ratio))
    const h = ratio >= 1 ? Math.max(12, Math.round(MAX / ratio)) : MAX
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, w, h)
    const { data } = ctx.getImageData(0, 0, w, h)

    const BINS = 12
    const weight = new Float32Array(BINS)
    const rSum = new Float32Array(BINS)
    const gSum = new Float32Array(BINS)
    const bSum = new Float32Array(BINS)

    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3] / 255
      if (a < 0.05) continue
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const [hue, sat, light] = rgbToHsl(r, g, b)
      if (light < 0.1 || light > 0.92 || sat < 0.1) continue
      const bin = Math.min(BINS - 1, Math.floor((hue / 360) * BINS))
      const w2 = a * sat * sat
      weight[bin] += w2
      rSum[bin] += r * w2
      gSum[bin] += g * w2
      bSum[bin] += b * w2
    }

    let primary = -1
    for (let i = 0; i < BINS; i++) if (primary < 0 || weight[i] > weight[primary]) primary = i
    if (primary < 0 || weight[primary] <= 0) return fallbackPalette(index)

    const avg = (bin) => {
      const w2 = weight[bin] || 1e-6
      return [rSum[bin] / w2, gSum[bin] / w2, bSum[bin] / w2]
    }

    let secondary = -1
    for (let i = 0; i < BINS; i++) {
      if (weight[i] <= 0) continue
      const dist = Math.min(Math.abs(i - primary), BINS - Math.abs(i - primary))
      if (dist >= 3 && (secondary < 0 || weight[i] > weight[secondary])) secondary = i
    }

    const [pr, pg, pb] = avg(primary)
    const [h1] = rgbToHsl(pr, pg, pb)
    // Saturation pushed well above the source's own average (extracted
    // hues tend to read muddier than the sampled pixels look, once
    // averaged across a bin) and lightness pulled down from a washed-out
    // pastel toward something with actual color in it.
    const c1 = hslToRgb(h1, 0.85, 0.5)
    const c2 = secondary >= 0 ? hslToRgb(rgbToHsl(...avg(secondary))[0], 0.8, 0.58) : hslToRgb(h1, 0.75, 0.6)

    return { c1, c2 }
  } catch {
    return fallbackPalette(index)
  }
}

export default function GradientCarousel({
  images,
  aspectRatio,
  cardAspectRatio = '1820 / 1024',
  className = '',
  // One CSS color per image, same order — lets a specific section (e.g. one
  // whose images ARE a brand color palette) give each position pin its own
  // fixed color instead of the neutral default.
  pinColors,
  // 'squish' (default): the springy overshoot-and-flatten transition.
  // 'smooth': a single soft, non-elastic width/color tween — no overshoot,
  // no axis-flatten, just a clean airy resize.
  pinStyle = 'squish',
  // Background gradient's color-vs-gray mix: 0 = fully desaturated (gray,
  // luminance-matched), 1 = full extracted color. 0.85 was picked by eye
  // via a temporary live slider (see the commented-out block in
  // Solution1.jsx) — lives in a ref, not the main effect's state, so it
  // can still be redriven by a live control later without tearing down/
  // rebuilding the whole carousel.
  saturationMix = 0.85,
}) {
  const stageRef = useRef(null)
  const cardsWrapRef = useRef(null)
  const cardRefs = useRef([])
  const bgCanvasRef = useRef(null)
  const pinRefs = useRef([])
  // Lets the pin buttons' onClick (a plain React handler, outside the
  // effect below) reach into the effect's own centerCard closure without
  // re-running the effect or lifting all that mutable animation state into
  // React state.
  const apiRef = useRef({})
  const saturationMixRef = useRef(saturationMix)
  useEffect(() => {
    saturationMixRef.current = saturationMix
  }, [saturationMix])

  useEffect(() => {
    const stage = stageRef.current
    const bgCanvas = bgCanvasRef.current
    const bgCtx = bgCanvas.getContext('2d', { alpha: false })
    const cards = cardRefs.current.filter(Boolean)
    if (!stage || cards.length === 0) return

    const [ratioW, ratioH] = cardAspectRatio.split('/').map((n) => parseFloat(n))
    const cardRatio = ratioW / ratioH

    let containerW = 0
    let containerH = 0
    let containerHalf = 0
    let cardW = 300
    let cardH = 200
    let gap = 24
    let step = cardW + gap
    let track = cards.length * step
    let perspective = 1200
    let maxRotation = 24
    let maxDepth = 80
    let minScale = 0.9
    let scaleRange = 0.12

    let scrollX = 0
    let vX = 0
    // A persistent tween target for centerCard's snap animation (rather than
    // a fresh object per call) so a new drag can gsap.killTweensOf() it —
    // grabbing the carousel mid-snap should hand control straight to the
    // drag, not fight an in-flight tween tied to an object nothing else can
    // reference.
    const scrollXProxy = { x: 0 }
    let activeIndex = -1
    // Each card's current signed X offset from stage-center, refreshed every
    // frame in updateTransforms. Clicks are resolved against this instead of
    // native DOM hit-testing (element.closest('.gc-card') / elementFromPoint)
    // — a rotated, perspective-projected card's actual clickable shape is
    // narrower than its flat CSS box (rotateY foreshortens it), so a click
    // aimed at the sliver of a neighbor card peeking out often lands in the
    // gap between cards rather than on the card itself. Picking whichever
    // card's own center is nearest the click position is what a person
    // actually means by "click the card peeking out on the left/right",
    // regardless of exactly which pixel they hit.
    let lastPositions = []
    let rafId = null
    let lastTime = 0
    let isCenteringTween = false

    // When a pin color is assigned for a slide, the gradient is built from
    // THAT color directly — it's already a deliberately chosen brand color,
    // so there's no need to re-derive one from the image's own pixels (and
    // no need to wait on image decode, either). Only slides without an
    // assigned pin color fall back to sampling the image, same as before.
    const palette = cards.map((_, i) => (pinColors?.[i] ? paletteFromPinColor(pinColors[i]) : null))
    cards.forEach((card, i) => {
      if (palette[i]) return
      const img = card.querySelector('img')
      const compute = () => {
        palette[i] = extractPalette(img, i)
        if (activeIndex === i) {
          activeIndex = -1
          setActiveGradient(i)
        }
      }
      if (img.complete && img.naturalWidth > 0) compute()
      else img.addEventListener('load', compute, { once: true })
    })

    const current = { r1: 217, g1: 217, b1: 217, r2: 217, g2: 217, b2: 217 }

    function measure() {
      const rect = stage.getBoundingClientRect()
      containerW = rect.width
      containerH = rect.height
      containerHalf = containerW / 2
      cardH = containerH * 0.66
      cardW = cardH * cardRatio
      // Purely proportional to containerW (no fixed-px floor) so the gap
      // keeps shrinking on narrow/mobile stages instead of bottoming out at
      // a constant that reads as oversized next to a much smaller card.
      // 0.035 is the ratio already in effect at the widest desktop
      // container (~863px, see .gc-stage's flex sizing in index.css).
      gap = containerW * 0.035
      step = cardW + gap
      track = cards.length * step
      perspective = Math.max(700, containerW * 1.35)
      maxRotation = 24
      maxDepth = containerW * 0.09
      minScale = 0.9
      // minScale + scaleRange must never exceed 1: the frontmost card sits
      // at invNorm = 1, so scale = minScale + scaleRange there. Anything
      // above 1 upscales an already-rasterized GPU layer, which forces the
      // compositor to interpolate/stretch the bitmap — visibly softening
      // exactly the card getting the most visual attention, even though the
      // source image itself has far more resolution than needed. Capped at
      // exactly 1.0 so the centered card always renders pixel-for-pixel.
      scaleRange = 0.1
      stage.style.perspective = `${perspective}px`
      cards.forEach((card) => {
        card.style.width = `${cardW}px`
        card.style.height = `${cardH}px`
      })
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      bgCanvas.width = Math.floor(containerW * dpr)
      bgCanvas.height = Math.floor(containerH * dpr)
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function transformFor(screenX) {
      const norm = Math.max(-1, Math.min(1, screenX / containerHalf))
      const invNorm = 1 - Math.abs(norm)
      const ry = -norm * maxRotation
      const tz = invNorm * maxDepth
      const scale = minScale + invNorm * scaleRange
      // The -50% on X centers the card ON screenX rather than placing its
      // left edge there — with `left: 50%` on .gc-card, translate3d's X
      // argument is an offset from the container's center point, and
      // without this the card's own left edge (not its middle) lands on
      // that point, making the "centered" card sit visibly right-shifted
      // inside a frame small enough to see the edges of (as opposed to the
      // original full-viewport demo, where that offset is imperceptible).
      return {
        transform: `translate3d(calc(${screenX}px - 50%), -50%, ${tz}px) rotateY(${ry}deg) scale(${scale})`,
        z: tz,
      }
    }

    // "Squish-squash" pin transition: height never changes (matches the
    // Figma "carousel pins" reference — every state has the same 60px-tall
    // module, only width differs), so the bounce is a brief vertical
    // flatten layered on top of the width tween itself growing/shrinking
    // between PIN_BASE_WIDTH and PIN_ACTIVE_WIDTH — the classic
    // animation-principle move of exaggerating a size change with an
    // opposite-axis compression on the way, rather than a plain linear
    // resize. Color only ever applies to the active pin (the reference's
    // inactive pins are always plain white); becoming active tweens IN the
    // assigned brand color, becoming inactive tweens back OUT to white.
    function animatePin(el, becomingActive, color) {
      if (!el) return
      gsap.killTweensOf(el)
      if (pinStyle === 'smooth') {
        // Clean, airy transition: one soft tween, no overshoot, no
        // axis-flatten — width and color settle together at an unhurried
        // pace instead of snapping/bouncing into place.
        gsap.to(el, {
          width: becomingActive ? PIN_ACTIVE_WIDTH : PIN_BASE_WIDTH,
          backgroundColor: becomingActive ? color : PIN_INACTIVE_COLOR,
          duration: 0.5,
          ease: 'sine.inOut',
        })
      } else {
        // "Squish-squash": height never changes (matches the Figma
        // "carousel pins" reference — every state has the same 60px-tall
        // module, only width differs), so the bounce is a brief vertical
        // flatten layered on top of the width tween itself growing/
        // shrinking between PIN_BASE_WIDTH and PIN_ACTIVE_WIDTH — the
        // classic animation-principle move of exaggerating a size change
        // with an opposite-axis compression on the way, rather than a
        // plain linear resize.
        const tl = gsap.timeline()
        if (becomingActive) {
          tl.to(el, { width: PIN_ACTIVE_WIDTH * 1.2, scaleY: 0.8, duration: 0.12, ease: 'power2.out', backgroundColor: color })
            .to(el, { width: PIN_ACTIVE_WIDTH, scaleY: 1, duration: 0.4, ease: 'back.out(2.2)' })
        } else {
          tl.to(el, { width: PIN_BASE_WIDTH * 0.65, scaleY: 0.8, duration: 0.1, ease: 'power2.out' }).to(el, {
            width: PIN_BASE_WIDTH,
            scaleY: 1,
            duration: 0.35,
            ease: 'back.out(2.2)',
            backgroundColor: PIN_INACTIVE_COLOR,
          })
        }
      }
      // Color only ever applies to the active pin (the reference's inactive
      // pins are always plain white); becoming active tweens IN the
      // assigned brand color, becoming inactive tweens back OUT to white.
      el.classList.toggle('gc-pin--active', becomingActive)
    }

    function setActiveGradient(index) {
      if (index === activeIndex) return
      const prevIndex = activeIndex
      activeIndex = index
      const pal = palette[index] || fallbackPalette(index)
      gsap.to(current, {
        r1: pal.c1[0],
        g1: pal.c1[1],
        b1: pal.c1[2],
        r2: pal.c2[0],
        g2: pal.c2[1],
        b2: pal.c2[2],
        duration: 0.5,
        ease: 'power2.out',
      })
      if (prevIndex >= 0) animatePin(pinRefs.current[prevIndex], false)
      animatePin(pinRefs.current[index], true, pinColors?.[index] ?? 'var(--color-text)')
    }

    function updateTransforms() {
      const half = track / 2
      let closest = 0
      let closestDist = Infinity
      const positions = cards.map((_, i) => {
        let pos = i * step - scrollX
        if (pos < -half) pos += track
        if (pos > half) pos -= track
        const dist = Math.abs(pos)
        if (dist < closestDist) {
          closestDist = dist
          closest = i
        }
        return pos
      })
      lastPositions = positions
      cards.forEach((card, i) => {
        const { transform, z } = transformFor(positions[i])
        card.style.transform = transform
        card.style.zIndex = String(1000 + Math.round(z))
      })
      setActiveGradient(closest)
    }

    // TEMP — luminance-matched gray for a channel triple, so the mix slider
    // reads as "same brightness, less/more color" rather than also
    // darkening/lightening things as it moves. Remove alongside
    // saturationMix/saturationMixRef once tuning is done.
    function mixTowardGray(r, g, b) {
      const mix = saturationMixRef.current
      if (mix >= 1) return [r, g, b]
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      return [gray + (r - gray) * mix, gray + (g - gray) * mix, gray + (b - gray) * mix]
    }

    function drawBackground() {
      const w = containerW
      const h = containerH
      bgCtx.fillStyle = '#f6f7f9'
      bgCtx.fillRect(0, 0, w, h)
      const t = performance.now() * 0.00025
      const cx = w * 0.5
      const cy = h * 0.5
      const a1 = Math.min(w, h) * 0.4
      const a2 = Math.min(w, h) * 0.3
      const x1 = cx + Math.cos(t) * a1
      const y1 = cy + Math.sin(t * 0.8) * a1 * 0.4
      const x2 = cx + Math.cos(-t * 0.9 + 1.2) * a2
      const y2 = cy + Math.sin(-t * 0.7 + 0.7) * a2 * 0.5
      const r1 = Math.max(w, h) * 0.8
      const r2 = Math.max(w, h) * 0.7

      const [m1r, m1g, m1b] = mixTowardGray(current.r1, current.g1, current.b1)
      const g1 = bgCtx.createRadialGradient(x1, y1, 0, x1, y1, r1)
      g1.addColorStop(0, `rgba(${m1r},${m1g},${m1b},1)`)
      g1.addColorStop(1, 'rgba(255,255,255,0)')
      bgCtx.fillStyle = g1
      bgCtx.fillRect(0, 0, w, h)

      const [m2r, m2g, m2b] = mixTowardGray(current.r2, current.g2, current.b2)
      const g2 = bgCtx.createRadialGradient(x2, y2, 0, x2, y2, r2)
      g2.addColorStop(0, `rgba(${m2r},${m2g},${m2b},0.9)`)
      g2.addColorStop(1, 'rgba(255,255,255,0)')
      bgCtx.fillStyle = g2
      bgCtx.fillRect(0, 0, w, h)
    }

    // True whenever nothing is actively moving the track — dragging,
    // coasting on momentum, or already mid-snap. Used to fire exactly one
    // settle-to-nearest-card snap the moment momentum runs out on its own,
    // rather than firing every frame once vX reaches 0.
    let isSettled = true

    function tick(t) {
      const dt = lastTime ? (t - lastTime) / 1000 : 0
      lastTime = t
      if (dragging) {
        isSettled = false
      } else if (!isCenteringTween) {
        scrollX = mod(scrollX + vX * dt, track)
        const decay = Math.pow(FRICTION, dt * 60)
        vX *= decay
        if (Math.abs(vX) < SNAP_VELOCITY_THRESHOLD) vX = 0
        if (vX !== 0) {
          isSettled = false
        } else if (!isSettled) {
          // Momentum just ran out on its own (not via a click, which
          // already calls centerCard directly) — waypoint onto whichever
          // card is currently nearest so it always comes to rest fully
          // centered and readable, never half-settled between two cards.
          isSettled = true
          centerCard(activeIndex)
        }
      }
      updateTransforms()
      drawBackground()
      rafId = requestAnimationFrame(tick)
    }

    measure()
    // Every pin starts at rest; setActiveGradient (called from the very
    // first updateTransforms below) animates just the initial active one
    // up from here, so it reads as a pop-in rather than appearing pre-sized.
    pinRefs.current.forEach((el) => {
      if (el) gsap.set(el, { width: PIN_BASE_WIDTH, scaleY: 1, backgroundColor: PIN_INACTIVE_COLOR })
    })
    // Default to centering the first card in the set — scrollX starts at 0,
    // which is item 0's own base position, so no offset needed here.
    scrollX = 0
    updateTransforms()
    drawBackground()
    rafId = requestAnimationFrame(tick)

    // --- Input: pointer drag + click only. No wheel listener at all, so
    // this never competes with the page's own wheel-driven scroller. ---
    let dragging = false
    let pointerId = null
    let startX = 0
    let startY = 0
    let lastX = 0
    let lastT = 0
    let lastVelocity = 0
    let totalMovement = 0

    function onPointerDown(e) {
      dragging = true
      // Grabbing the carousel — whether it's coasting on momentum or mid
      // snap-into-place — hands control to the drag immediately instead of
      // fighting whatever motion was already in progress.
      gsap.killTweensOf(scrollXProxy)
      isCenteringTween = false
      vX = 0
      pointerId = e.pointerId
      startX = lastX = e.clientX
      startY = e.clientY
      lastT = performance.now()
      lastVelocity = 0
      totalMovement = 0
      stage.setPointerCapture(pointerId)
      stage.classList.add('gc-dragging')
      stage.classList.remove('gc-nav-hover')
    }

    // Swaps the drag cursor for a pointer cursor over the outer-sixth
    // next/prev zones so hovering there reads as "click to advance," not
    // "drag the carousel."
    function updateNavHover(e) {
      if (dragging) return
      const stageRect = stage.getBoundingClientRect()
      const localX = e.clientX - (stageRect.left + containerW / 2)
      const inNavZone = Math.abs(localX) >= containerHalf * (2 / 3)
      stage.classList.toggle('gc-nav-hover', inNavZone)
    }

    function onPointerLeave() {
      stage.classList.remove('gc-nav-hover')
    }

    function onPointerMove(e) {
      if (!dragging || e.pointerId !== pointerId) return
      const now = performance.now()
      const dx = e.clientX - lastX
      const dt = Math.max(1, now - lastT) / 1000
      totalMovement += Math.abs(dx) + Math.abs(e.clientY - startY) * 0
      isCenteringTween = false
      scrollX = mod(scrollX - dx * DRAG_SENS, track)
      lastVelocity = dx / dt
      lastX = e.clientX
      lastT = now
      e.preventDefault()
    }

    function centerCard(index) {
      const half = track / 2
      let pos = index * step - scrollX
      if (pos < -half) pos += track
      if (pos > half) pos -= track
      const target = scrollX + pos
      gsap.killTweensOf(scrollXProxy)
      scrollXProxy.x = scrollX
      isCenteringTween = true
      isSettled = true
      vX = 0
      gsap.to(scrollXProxy, {
        x: target,
        duration: SNAP_TWEEN_DURATION,
        ease: 'power3.out',
        onUpdate: () => {
          scrollX = mod(scrollXProxy.x, track)
        },
        onComplete: () => {
          isCenteringTween = false
        },
      })
    }
    apiRef.current.goToIndex = centerCard

    function onPointerUp(e) {
      if (!dragging || e.pointerId !== pointerId) return
      dragging = false
      stage.releasePointerCapture(pointerId)
      stage.classList.remove('gc-dragging')
      if (totalMovement < CLICK_MAX_MOVEMENT) {
        const stageRect = stage.getBoundingClientRect()
        const localX = e.clientX - (stageRect.left + containerW / 2)
        // The outer quarter of the stage on each side is always a
        // next/prev click, regardless of exactly where a peeking neighbor
        // card's own edge happens to fall — a wide, easy-to-hit advance
        // zone rather than one scaled to card/gap geometry.
        if (localX <= -containerHalf / 2) {
          centerCard(mod(activeIndex - 1, cards.length))
        } else if (localX >= containerHalf / 2) {
          centerCard(mod(activeIndex + 1, cards.length))
        } else {
          // Inner half: resolve by nearest card CENTER (see lastPositions
          // comment above), not by which element the click physically
          // landed on.
          let nearest = 0
          let nearestDist = Infinity
          lastPositions.forEach((pos, i) => {
            const d = Math.abs(pos - localX)
            if (d < nearestDist) {
              nearestDist = d
              nearest = i
            }
          })
          centerCard(nearest)
        }
      } else {
        vX = -lastVelocity * DRAG_SENS
      }
    }

    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('pointermove', onPointerMove)
    stage.addEventListener('pointermove', updateNavHover)
    stage.addEventListener('pointerleave', onPointerLeave)
    stage.addEventListener('pointerup', onPointerUp)
    stage.addEventListener('pointercancel', onPointerUp)
    stage.addEventListener('dragstart', (e) => e.preventDefault())

    const resizeObserver = new ResizeObserver(() => {
      const prevTrack = track || 1
      const ratio = scrollX / prevTrack
      measure()
      scrollX = mod(ratio * track, track)
      updateTransforms()
    })
    resizeObserver.observe(stage)

    function onVisibility() {
      if (document.hidden) {
        if (rafId) cancelAnimationFrame(rafId)
        rafId = null
      } else if (!rafId) {
        lastTime = 0
        rafId = requestAnimationFrame(tick)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      stage.removeEventListener('pointerdown', onPointerDown)
      stage.removeEventListener('pointermove', onPointerMove)
      stage.removeEventListener('pointermove', updateNavHover)
      stage.removeEventListener('pointerleave', onPointerLeave)
      stage.removeEventListener('pointerup', onPointerUp)
      stage.removeEventListener('pointercancel', onPointerUp)
    }
  }, [images, cardAspectRatio, pinStyle, pinColors])

  return (
    <div className={`gc-stage${className ? ` ${className}` : ''}`} ref={stageRef} style={{ aspectRatio }}>
      <canvas className="gc-bg" ref={bgCanvasRef} aria-hidden="true" />
      <div className="gc-cards" ref={cardsWrapRef}>
        {images.map((src, i) => (
          <article
            className="gc-card"
            key={src}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
          >
            <img className="gc-card__img" src={src} alt="" draggable={false} />
          </article>
        ))}
      </div>
      {/* Sits inside the frame, under the centered card (see the margin
          left by cardH being 66% of the container's own height) rather than
          below the frame as a separate strip. */}
      <div className="gc-pins" role="tablist" aria-label="Carousel position">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            role="tab"
            className="gc-pin"
            aria-label={`Go to image ${i + 1} of ${images.length}`}
            ref={(el) => {
              pinRefs.current[i] = el
            }}
            onClick={() => apiRef.current.goToIndex?.(i)}
          />
        ))}
      </div>
    </div>
  )
}
