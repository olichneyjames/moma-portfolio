import BodyFrame from '../components/BodyFrame.jsx'
import GradientCarousel from '../components/GradientCarousel.jsx'
import { bodyFrames } from '../content/bodyFrames.jsx'
import carouselInspiration from '../assets/carousel-2-inspiration.png'
import carouselTypeCover from '../assets/carousel-2-typecover.png'
import carouselObjects from '../assets/carousel-2-objects.png'
import carouselSpaceCover from '../assets/carousel-2-spacecover.png'
import carouselCover from '../assets/carousel-2-cover.png'

// Left-to-right order per the "carousel 2" frame group in the Figma
// "current implemented" page (node 258:4893): Inspiration, Type Cover,
// Images of Physical Objects, Space Cover, Cover.
const solution2Images = [carouselInspiration, carouselTypeCover, carouselObjects, carouselSpaceCover, carouselCover]

// Pin colors mapped by POSITION, sampled from that same page's own
// "carousel 1 pins" frame positioned next to carousel 2 (node 258:5096) —
// its 5 example states color position 1-5 as red-orange, blue, green,
// purple, yellow (all 5 brand colors used once each, unlike carousel 1's
// pins).
const solution2PinColors = ['#FF6535', '#4DCAFF', '#A9CC29', '#B473FF', '#FEB941']

export default function Solution2() {
  const { solution2 } = bodyFrames

  return (
    <section className="frame section section--body" data-frame="7">
      <div className="section-row">
        <div className="section-row__text">
          <BodyFrame label={solution2.label} copy={solution2.copy} />
        </div>

        <div className="section-row__image reveal">
          <GradientCarousel
            aspectRatio="864 / 614"
            cardAspectRatio="1820 / 1024"
            images={solution2Images}
            pinColors={solution2PinColors}
          />
        </div>
      </div>
    </section>
  )
}
