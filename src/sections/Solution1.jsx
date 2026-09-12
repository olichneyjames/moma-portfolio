import BodyFrame from '../components/BodyFrame.jsx'
import GradientCarousel from '../components/GradientCarousel.jsx'
import { bodyFrames } from '../content/bodyFrames.jsx'
import carouselLogo from '../assets/carousel-1-logo.png'
import carouselColor from '../assets/carousel-1-color.png'
import carouselType from '../assets/carousel-1-type.png'
import carouselPeople from '../assets/carousel-1-people.png'
import carouselMedia from '../assets/carousel-1-media.png'

// Left-to-right order per the "carousel 1" frame group in Figma: Color,
// Logo, Images of People, Images of Media, Type. Images of Physical
// Objects (position 4) was replaced with Images of Media. The carousel
// opens on whichever card is first in this list (Color).
const solution1Images = [carouselColor, carouselLogo, carouselPeople, carouselMedia, carouselType]

// Pin colors mapped by POSITION, per the "carousel 1 pins" reference:
// frame 1 (Color) = green, 2 (Logo) = purple, 3 (People) = orange,
// 4 (Media) = yellow, 5 (Type) = orange again. (Frame 1 was blue; updated
// to green to match the reference's current state.)
const solution1PinColors = ['#A9CC29', '#B473FF', '#FF6535', '#FEB941', '#FF6535']

export default function Solution1() {
  const { solution1 } = bodyFrames

  return (
    <section className="frame section section--body" data-frame="6">
      <div className="section-row">
        <div className="section-row__text">
          <BodyFrame label={solution1.label} copy={solution1.copy} />
        </div>

        <div className="section-row__image reveal">
          <GradientCarousel
            aspectRatio="864 / 614"
            cardAspectRatio="1820 / 1024"
            images={solution1Images}
            pinColors={solution1PinColors}
            pinStyle="smooth"
          />
        </div>
      </div>
    </section>
  )
}
