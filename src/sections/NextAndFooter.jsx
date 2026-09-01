import Placeholder from '../components/Placeholder.jsx'

export default function NextAndFooter() {
  return (
    <section className="frame section" data-frame="4">
      <div className="footer-top">
        <div className="footer-top__col">
          <p className="next-nav__link reveal">&lt; New York Times Games</p>
          <div className="next-nav__tags reveal">
            <p>UX Research</p>
            <p>Quantitative &amp; Qualitative Methods</p>
            <p>Benchmarking</p>
            <p>Focus Groups</p>
          </div>
        </div>

        <div className="footer-top__col footer-top__col--right">
          <p className="next-nav__link reveal">The Philadelphia Inquirer &gt;</p>
          <div className="next-nav__tags reveal">
            <p>Product Design</p>
            <p>AI Tooling</p>
            <p>Competitive Analysis</p>
          </div>
        </div>
      </div>

      <div className="footer-band reveal">
        <Placeholder aspectRatio="1440 / 410" label="footer" fontSize={91.789} />
      </div>
    </section>
  )
}
