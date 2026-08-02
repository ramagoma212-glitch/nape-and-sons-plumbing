export default function PageHero({ eyebrow, title, description, children }) {
  return (
    <section className="relative overflow-hidden bg-navy pt-32 pb-16 sm:pt-36 sm:pb-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(213,168,75,0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(18,59,93,0.6), transparent 55%)',
        }}
        aria-hidden="true"
      />
      <div className="container-page relative">
        <div className="max-w-2xl fade-up">
          {eyebrow && <span className="eyebrow text-gold">{eyebrow}</span>}
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            {title}
          </h1>
          {description && <p className="mt-5 text-base sm:text-lg text-white/75">{description}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  )
}
