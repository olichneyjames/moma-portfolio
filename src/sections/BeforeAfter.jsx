import BodyFrame from '../components/BodyFrame.jsx'
import Placeholder from '../components/Placeholder.jsx'
import { bodyFrames } from '../content/bodyFrames.jsx'

export default function BeforeAfter() {
  const { before, after } = bodyFrames

  return (
    <section className="frame" data-frame="2">
      <BodyFrame label={before.label} copy={before.copy} labelTop={245} copyTop={304} />
      <BodyFrame label={after.label} copy={after.copy} labelTop={499} copyTop={558} />

      <div className="reveal">
        <Placeholder left={576} top={205} width={864} height={614} label="image 2" parallax />
      </div>
    </section>
  )
}
