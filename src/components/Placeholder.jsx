export default function Placeholder({
  label,
  aspectRatio,
  height,
  fontSize = 63.734,
  parallax = false,
  src,
  className = '',
}) {
  return (
    <div
      className={`placeholder${parallax ? ' parallax' : ''}${className ? ` ${className}` : ''}`}
      style={{ aspectRatio, height }}
      data-placeholder={label}
    >
      {src ? (
        <img className="placeholder__image" src={src} alt={label} />
      ) : (
        <span className="placeholder__label" style={{ fontSize }}>
          {label}
        </span>
      )}
    </div>
  )
}
