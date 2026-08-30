import Placeholder from '../components/Placeholder.jsx'

export default function Hero() {
  return (
    <section className="frame hero-frame" data-frame="1">
      {/* Static from the start — no reveal/parallax on the header */}
      <Placeholder left={0} top={0} width={1440} height={100} label="header" />

      <h1 className="abs hero__title reveal" style={{ left: 80, top: 180, width: 1072 }}>
        Museum of Art and <br />
        Digital Entertainment
      </h1>

      <div className="abs hero__tags reveal" style={{ left: 80, top: 552 }}>
        <span>Brand Design</span>
        <span>Visual Design</span>
        <span>Social Media</span>
      </div>

      <div className="abs hero__copy reveal" style={{ left: 80, top: 613, width: 416 }}>
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

      <div className="reveal">
        <Placeholder
          left={576}
          top={512}
          width={864}
          height={512}
          label="image cover"
          parallax
        />
      </div>
    </section>
  )
}
