import BodyFrame from '../components/BodyFrame.jsx'
import Placeholder from '../components/Placeholder.jsx'
import { bodyFrames } from '../content/bodyFrames.jsx'

export default function Results() {
  const { results } = bodyFrames

  return (
    <section className="frame section section--body" data-frame="8">
      <div className="section-row">
        <div className="section-row__text">
          <BodyFrame label={results.label} copy={results.copy} />
        </div>

        <div className="section-row__image reveal">
          <Placeholder aspectRatio="864 / 614" label="image 7" parallax />
        </div>
      </div>
    </section>
  )
}
