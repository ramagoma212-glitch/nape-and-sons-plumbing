export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  light = false,
}) {
  const alignment = align === 'center' ? 'text-center mx-auto items-center' : 'text-left'

  return (
    <div className={`flex flex-col gap-4 max-w-2xl ${alignment}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2
        className={`text-3xl sm:text-4xl font-bold leading-tight ${light ? 'text-white' : 'text-navy'}`}
      >
        {title}
      </h2>
      {description && (
        <p className={`text-base sm:text-lg ${light ? 'text-white/75' : 'text-ink/70'}`}>
          {description}
        </p>
      )}
    </div>
  )
}
