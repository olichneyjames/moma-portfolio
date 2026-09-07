import BodyFrame from '../components/BodyFrame.jsx'
import Placeholder from '../components/Placeholder.jsx'
import { bodyFrames } from '../content/bodyFrames.jsx'

export default function Insights() {
  const { insights } = bodyFrames

  return (
    <section className="frame section section--body" data-frame="5">
      <div className="section-row">
        <div className="section-row__text">
          <BodyFrame label={insights.label} copy={insights.copy} />
        </div>

        <div className="section-row__image reveal">
          <Placeholder aspectRatio="864 / 614" label="image 4" parallax />
        </div>
      </div>
    </section>
  )
}
