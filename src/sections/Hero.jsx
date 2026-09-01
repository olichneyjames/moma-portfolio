import Placeholder from '../components/Placeholder.jsx'

export default function Hero() {
  return (
    <section className="frame section" data-frame="1">
      {/* Static from the start — no reveal/parallax on the header */}
      <Placeholder label="header" className="header-bar" />

      <h1 className="hero__title reveal">
        Museum of Art and <br />
        Digital Entertainment
      </h1>

      {/* --hero variants throughout: the hero row doesn't always share body
          sections' proportions. At laptop specifically it keeps its own
          padding/gap/split (barely shrunk from desktop) instead of the
          253:614 split body sections use; at tablet/mobile its text column
          wraps at a different grid column too. See the matching CSS
          comments on .section-row--hero, .section-row__text--hero, and
          .section-row__image--hero. */}
      <div className="section-row section-row--hero">
        <div className="section-row__text section-row__text--hero">
          {/* Rendered in reverse (last tag first); .hero__tags flips it back to
              reading order with row-reverse. Combined with wrap-reverse, this
              makes the wrap algorithm fill lines starting from the *last* tag,
              so if a line breaks, the leftover partial line — forced smaller by
              the wrap-reverse rule below — contains the earliest tags and lands
              on top. See the CSS comment on .hero__tags. */}
          <div className="hero__tags reveal">
            <span>Social Media</span>
            <span>Visual Design</span>
            <span>Brand Design</span>
          </div>

          <div className="hero__copy reveal">
            <p className="hero__copy-desc">
              <span className="fw-semibold">
                I designed the museum&rsquo;s current official brand system and brand book.
              </span>{' '}
              While the museum had a vague visual preference, we delivered a needed centralized
              resource that would excite volunteers and unify new signage under a single playful
              visual language.
            </p>
            <p>August - September 2025</p>
            <p>Collaborator: Design Mentor - Andrew Watterson</p>
          </div>
        </div>

        <div className="section-row__image section-row__image--hero reveal">
          <Placeholder aspectRatio="864 / 512" label="image cover" parallax />
        </div>
      </div>
    </section>
  )
}
