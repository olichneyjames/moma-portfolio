import BodyFrame from '../components/BodyFrame.jsx'
import { bodyFrames } from '../content/bodyFrames.jsx'

export default function Problem() {
  const { problem } = bodyFrames

  return (
    <section className="frame" data-frame="3">
      <BodyFrame
        label={problem.label}
        copy={problem.copy}
        labelTop={245}
        copyTop={304}
        image={{ left: 576, top: 205, width: 864, height: 614, label: 'image 3' }}
      />
    </section>
  )
}
