import BodyFrame from '../components/BodyFrame.jsx'
import Placeholder from '../components/Placeholder.jsx'
import { bodyFrames } from '../content/bodyFrames.jsx'

export default function Reflection() {
  const { reflection } = bodyFrames

  return (
    <section className="frame section section--body" data-frame="9">
      <div className="section-row">
        <div className="section-row__text">
          <BodyFrame label={reflection.label} copy={reflection.copy} />
        </div>

        <div className="section-row__image reveal">
          <Placeholder aspectRatio="864 / 614" label="image 8" parallax />
        </div>
      </div>
    </section>
  )
}
