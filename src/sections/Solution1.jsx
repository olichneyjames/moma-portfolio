import BodyFrame from '../components/BodyFrame.jsx'
import Placeholder from '../components/Placeholder.jsx'
import { bodyFrames } from '../content/bodyFrames.jsx'

export default function Solution1() {
  const { solution1 } = bodyFrames

  return (
    <section className="frame section section--body" data-frame="6">
      <div className="section-row">
        <div className="section-row__text">
          <BodyFrame label={solution1.label} copy={solution1.copy} />
        </div>

        <div className="section-row__image reveal">
          <Placeholder aspectRatio="864 / 614" label="image 5" parallax />
        </div>
      </div>
    </section>
  )
}
