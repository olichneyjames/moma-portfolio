export default function Placeholder({
  left,
  top,
  width,
  height,
  label,
  fontSize = 63.734,
  parallax = false,
}) {
  return (
    <div
      className={`abs placeholder${parallax ? ' parallax' : ''}`}
      style={{ left, top, width, height }}
      data-placeholder={label}
    >
      <span className="placeholder__label" style={{ fontSize }}>
        {label}
      </span>
    </div>
  )
}
