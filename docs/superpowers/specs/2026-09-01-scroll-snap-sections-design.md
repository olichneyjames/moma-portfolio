# Scroll-snap sections

## Goal

Scrolling should feel like it has "notches" at each of the site's four sections (Hero,
Before/After, Problem, footer). Letting go of the scroll — or flicking through — should
naturally settle the page on a section boundary rather than stopping partway through one,
with no custom scroll-hijacking JS.

This is unrelated to (and replaces, as a direction) the earlier "book-scroll" pinned
content-swap exploration for the Before/After → Problem transition, which was scrapped.
No code from that exploration exists in the repo; only throwaway prototypes lived under
the gitignored `.superpowers/brainstorm/` folder.

## Mechanism

Native CSS scroll-snap (`scroll-snap-type` / `scroll-snap-align` / `scroll-snap-stop`).
No JavaScript, no wheel/touch event interception. This is a deliberate reaction to how
fragile custom scroll-jacking proved to be in the scrapped exploration (mouse-wheel flicks
with large deltas skipping the pinned zone entirely, etc.) — the native browser
implementation handles wheel, trackpad, touch, and scrollbar-drag input correctly for
free, and requires no per-input-device tuning.

## Snap points

All four top-level sections act as snap points, via the existing shared `.section` class
already applied to each of them in `Hero.jsx`, `BeforeAfter.jsx`, `Problem.jsx`, and
`NextAndFooter.jsx`:

```css
.section {
  scroll-snap-align: start;
}
```

The scroll-snap container is `html` (the document itself already scrolls normally; there
is no inner `overflow: auto` wrapper to redirect this onto).

## Breakpoint-tiered strength

Snap strength follows the project's existing `max-width: 1023px` tablet/mobile split
(the same breakpoint the responsive system already uses to switch body sections from a
side-by-side row to a stacked layout):

- **≥1024px (desktop/laptop):** `scroll-snap-type: y mandatory` + `scroll-snap-stop: always`
  on `.section`. Every scroll gesture is guaranteed to land exactly on a section, and a
  single fast fling cannot blow past more than one section at a time — this is the
  "powerful, distinct notches" feel requested for larger screens.
- **<1024px (tablet/mobile):** `scroll-snap-type: y proximity`, no `scroll-snap-stop`.
  Only pulls the page into alignment if the user releases scroll near a section boundary;
  otherwise scrolling is completely free. This avoids fighting momentum-scroll physics or
  making it hard to read through a tall stacked section on a small screen.

## Interaction with existing scroll animations

The GSAP `ScrollTrigger`-driven `.reveal` and `.parallax` animations in `App.jsx` read
scroll position passively (via `scrollTrigger.start`/`end` and `scrub`) — they don't
own or intercept scroll themselves, so native scroll-snap changing *how* the user arrives
at a given scroll position doesn't require any changes to that code. Worth a manual check
after implementing: confirm the snap-driven scroll (which can be an abrupt jump on a fast
mandatory-tier fling) doesn't visually outrun a scrubbed parallax/reveal animation in a
jarring way; if it does, the fix is tuning existing `ScrollTrigger` `start`/`end` values,
not adding new JS.

## Out of scope

- No visual "dot" navigation indicator for which section/notch is active.
- No custom easing/animation on the snap itself — this uses the browser's native snap
  behavior as-is.
- No changes to the mobile/tablet stacked layout itself, only the addition of snap
  behavior on top of it.

## Testing

Manual verification across the four breakpoint tiers (desktop, laptop, tablet, mobile) via
the responsive emulation already used elsewhere in this project, checking:
- Mandatory tier (≥1024px): scrolling/flinging always lands exactly on a section top edge;
  a fast fling doesn't skip past more than one section.
- Proximity tier (<1024px): scrolling is free-feeling; only snaps when released near a
  boundary.
- No visual regression in the existing reveal/parallax animations.
