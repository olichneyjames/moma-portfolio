// Reusable "info block" pattern: a label + copy block, stacked in the fixed
// text column next to a section's image. Frames 2 & 3 are both instances of
// this; future case-study sections should reuse it too.
export default function BodyFrame({ label, copy, className = '' }) {
  return (
    <div className={`info-block ${className}`}>
      <p className="info-block__label reveal">{label}</p>
      <div className="info-block__copy reveal">{copy}</div>
    </div>
  )
}
