# Scroll-Snap Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the page's four sections (Hero, Before/After, Problem, footer) act as scroll "notches" — mandatory snap on desktop/laptop (≥1024px), gentle proximity snap on tablet/mobile (<1024px) — using native CSS scroll-snap only, no JS.

**Architecture:** Pure CSS. `html` becomes the scroll-snap container (`scroll-snap-type`); the existing shared `.section` class (already applied to all four top-level `<section>` elements) becomes the snap target (`scroll-snap-align: start`). Strength is tiered by the project's existing `max-width: 1023px` breakpoint, which already exists in `src/styles/index.css` for the row→stack layout switch.

**Tech Stack:** Vite + React (no test framework in this repo — verification is manual, via the dev server and the Browser pane's resize/scroll tooling, matching how every prior CSS change in this project has been verified).

**Reference spec:** `docs/superpowers/specs/2026-09-01-scroll-snap-sections-design.md`

---

### Task 1: Desktop/laptop mandatory snap (≥1024px, the default/unprefixed tier)

**Files:**
- Modify: `src/styles/index.css:73-79` (the shared `html, body` rule)
- Modify: `src/styles/index.css:95-99` (the `.section` rule)

- [ ] **Step 1: Add the scroll-snap container to `html`**

In `src/styles/index.css`, the file currently has this at line 73:

```css
html,
body {
  margin: 0;
  padding: 0;
  background: var(--color-bg);
  color: var(--color-text);
}
```

Add a new `html` rule directly after it (before the existing `body { font-family: ...}` rule at what is currently line 81):

```css
/* Scroll-snap container. Strength is tiered by viewport — mandatory here
   (desktop/laptop default), downgraded to proximity at the tablet/mobile
   breakpoint below (max-width: 1023px). Mandatory guarantees every
   scroll/fling lands exactly on a section; proximity only pulls the page
   into alignment if you let go near a boundary, so it doesn't fight
   normal reading scroll on smaller screens. */
html {
  scroll-snap-type: y mandatory;
}
```

- [ ] **Step 2: Make `.section` a snap target**

The existing rule at line 95:

```css
.section {
  position: relative;
  width: 100%;
  background: var(--color-bg);
}
```

becomes:

```css
.section {
  position: relative;
  width: 100%;
  background: var(--color-bg);
  scroll-snap-align: start;
  /* Prevents a single fast fling from skipping past more than one
     section at the mandatory tier above — each section gets its own
     stop. Overridden back to `normal` at the proximity tier below. */
  scroll-snap-stop: always;
}
```

`.section` is already applied to all four top-level sections (`Hero.jsx`, `BeforeAfter.jsx`, `Problem.jsx`, `NextAndFooter.jsx` each render `<section className="frame section ...">`), so no JSX changes are needed.

- [ ] **Step 3: Start the dev server and confirm it builds clean**

Run:
```bash
npm run dev
```
Expected: Vite starts with no errors, and the terminal prints a local URL (e.g. `http://localhost:5173`).

- [ ] **Step 4: Verify mandatory snap at desktop width**

Open the app in the Browser pane (`preview_start` with the `dev` launch config, or `navigate` to the printed URL), resize to a desktop width (≥1440px wide), then scroll down through the page (mouse wheel or trackpad) and check:
- Scrolling lands exactly on each section's top edge (Hero → Before/After → Problem → footer) — the browser never rests with a section partially cut off at the top of the viewport.
- A fast, hard scroll/fling does not skip past more than one section at a time.

- [ ] **Step 5: Verify mandatory snap at laptop width**

Resize to a laptop width (1024–1439px) and repeat the same check as Step 4. This tier has no separate scroll-snap override, so it should inherit the same mandatory behavior from the base rule.

- [ ] **Step 6: Commit**

```bash
git add src/styles/index.css
git commit -m "$(cat <<'EOF'
Add mandatory scroll-snap on desktop/laptop sections

Each top-level section (Hero, Before/After, Problem, footer) now snaps
to the top of the viewport on scroll release/fling at >=1024px, using
native CSS scroll-snap rather than custom scroll-jacking JS.
EOF
)"
```

---

### Task 2: Tablet/mobile proximity snap (<1024px)

**Files:**
- Modify: `src/styles/index.css:400-458` (the `@media (max-width: 1023px)` block)

- [ ] **Step 1: Downgrade to proximity snap inside the existing tablet/mobile media query**

In `src/styles/index.css`, the `@media (max-width: 1023px)` block currently closes its `:root { ... }` section at line 427, then continues with `.section-row { ... }` at line 429:

```css
    --footer-band-margin-top: 56px;
  }

  .section-row {
```

Insert a new rule block between the closing `}` of `:root` and `.section-row`:

```css
    --footer-band-margin-top: 56px;
  }

  /* Downgrade from the mandatory tier above: proximity only pulls the
     page into alignment when you release scroll near a section
     boundary, so it stays free-scrolling for reading through a tall
     stacked section on a smaller screen. */
  html {
    scroll-snap-type: y proximity;
  }

  .section {
    scroll-snap-stop: normal;
  }

  .section-row {
```

- [ ] **Step 2: Verify proximity snap at tablet width**

With the dev server still running, resize the Browser pane to a tablet width (768–1023px). Scroll partway into the middle of the Before/After or Problem section and stop — the page should NOT jump to snap you to a boundary (unlike the mandatory tier). Then release a scroll gesture close to a section's top edge — the page should ease into alignment there.

- [ ] **Step 3: Verify proximity snap at mobile width**

Resize to a mobile width (≤767px) and repeat the same check as Step 2.

- [ ] **Step 4: Commit**

```bash
git add src/styles/index.css
git commit -m "$(cat <<'EOF'
Downgrade scroll-snap to proximity on tablet/mobile

Mandatory snap fights momentum scroll and reading a tall stacked
section on smaller screens, so tablet/mobile (<1024px) get the gentler
proximity mode instead: sections only pull into alignment when scroll
is released near a boundary.
EOF
)"
```

---

### Task 3: Full cross-tier regression check (no code changes)

**Files:** none — verification only.

- [ ] **Step 1: Re-verify all four breakpoint tiers in one pass**

With the dev server running, resize through each of the project's four tiers (desktop ≥1440px, laptop 1024–1439px, tablet 768–1023px, mobile ≤767px) and scroll the full page top to bottom at each one, confirming:
- Desktop and laptop: hard mandatory snap, exactly as in Task 1.
- Tablet and mobile: gentle proximity snap, exactly as in Task 2.

- [ ] **Step 2: Confirm the existing GSAP reveal/parallax animations still look correct**

At desktop width, scroll slowly through the whole page and check:
- Each `.reveal` element (hero title, tags, copy, images, footer content) still fades/slides in as it enters view, same as before this change.
- The `.parallax` images in the Before/After and Problem sections still drift slightly during scroll, same as before.
- Nothing looks visually broken or jarring where the mandatory snap's scroll jump lands relative to these scrubbed animations. If something does look off, the fix is tuning the existing `ScrollTrigger` `start`/`end` values in `src/App.jsx` — not new JS — but this is not expected to be needed for this change.

- [ ] **Step 3: Report result**

If everything in Steps 1–2 checks out, the feature is complete — no further commit needed (Task 3 is verification-only). If something is off, note exactly what and where before considering this plan done.
