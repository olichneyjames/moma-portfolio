import BodyFrame from '../components/BodyFrame.jsx'
import Placeholder from '../components/Placeholder.jsx'
import { bodyFrames } from '../content/bodyFrames.jsx'

export default function Solution2() {
  const { solution2 } = bodyFrames

  return (
    <section className="frame section section--body" data-frame="7">
      <div className="section-row">
        <div className="section-row__text">
          <BodyFrame label={solution2.label} copy={solution2.copy} />
        </div>

        <div className="section-row__image reveal">
          <Placeholder aspectRatio="864 / 614" label="image 6" parallax />
        </div>
      </div>
    </section>
  )
}
