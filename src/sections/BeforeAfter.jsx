import BodyFrame from '../components/BodyFrame.jsx'
import Placeholder from '../components/Placeholder.jsx'
import { bodyFrames } from '../content/bodyFrames.jsx'

export default function BeforeAfter() {
  const { before, after } = bodyFrames

  return (
    <section className="frame section section--body" data-frame="2">
      <div className="section-row">
        <div className="section-row__text">
          <BodyFrame label={before.label} copy={before.copy} />
          <BodyFrame label={after.label} copy={after.copy} />
        </div>

        <div className="section-row__image reveal">
          <Placeholder aspectRatio="864 / 614" label="image 2" parallax />
        </div>
      </div>
    </section>
  )
}
