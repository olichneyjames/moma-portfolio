import Placeholder from './Placeholder.jsx'

// Reusable "body frame" pattern: a label + copy block on the left, with an
// optional image placeholder on the right. Frames 2 & 3 are both instances of
// this; future case-study sections should reuse it too.
export default function BodyFrame({
  label,
  copy,
  labelTop = 245,
  copyTop = 304,
  left = 80,
  width = 416,
  image,
  className = '',
}) {
  return (
    <div className={`body-frame ${className}`}>
      <p className="abs body-frame__label reveal" style={{ left, top: labelTop }}>
        {label}
      </p>
      <div className="abs body-frame__copy reveal" style={{ left, top: copyTop, width }}>
        {copy}
      </div>
      {image ? (
        <div className="reveal">
          <Placeholder
            left={image.left ?? 576}
            top={image.top ?? 205}
            width={image.width ?? 864}
            height={image.height ?? 614}
            label={image.label ?? 'image'}
            parallax={image.parallax ?? true}
          />
        </div>
      ) : null}
    </div>
  )
}
