import BodyFrame from '../components/BodyFrame.jsx'
import Placeholder from '../components/Placeholder.jsx'
import { bodyFrames } from '../content/bodyFrames.jsx'

export default function Problem() {
  const { problem } = bodyFrames

  return (
    <section className="frame section section--body" data-frame="3">
      <div className="section-row">
        <div className="section-row__text">
          <BodyFrame label={problem.label} copy={problem.copy} />
        </div>

        <div className="section-row__image reveal">
          <Placeholder aspectRatio="864 / 614" label="image 3" parallax />
        </div>
      </div>
    </section>
  )
}
