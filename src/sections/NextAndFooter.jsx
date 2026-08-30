import Placeholder from '../components/Placeholder.jsx'

// Frame 4 has no image of its own anymore — it's short (614.4px) on purpose so
// frame 3's "image 3" naturally stays visible on screen above it while scrolling.
export const FRAME_HEIGHT = 614.4

export default function NextAndFooter() {
  return (
    <section className="frame" data-frame="4" style={{ height: FRAME_HEIGHT }}>
      <p className="abs next-nav__link reveal" style={{ left: 80, top: 0 }}>
        &lt; New York Times Games
      </p>
      <p className="abs next-nav__link reveal" style={{ left: 1139, top: 0 }}>
        The Philadelphia Inquirer &gt;
      </p>

      <div className="abs next-nav__tags reveal" style={{ left: 98, top: 37, width: 416 }}>
        <p>UX Research</p>
        <p>Quantitative &amp; Qualitative Methods</p>
        <p>Benchmarking</p>
        <p>Focus Groups</p>
      </div>

      <div
        className="abs next-nav__tags next-nav__tags--right reveal"
        style={{ left: 944, top: 37, width: 416 }}
      >
        <p>Product Design</p>
        <p>AI Tooling</p>
        <p>Competitive Analysis</p>
      </div>

      <div className="reveal">
        <Placeholder
          left={0}
          top={204}
          width={1440}
          height={410}
          label="footer"
          fontSize={91.789}
        />
      </div>
    </section>
  )
}
