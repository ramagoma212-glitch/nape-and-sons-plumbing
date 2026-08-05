// lucide-react has no TikTok glyph, so this is a small hand-drawn stand-in
// (a musical note with the sound-wave motif) using the exact same
// stroke conventions as lucide's own icons, so it sits naturally next to
// the Facebook icon rather than looking like a mismatched brand mark.
export default function TikTokIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4" />
      <path d="M13 7a5 5 0 0 0 5 5V8" />
    </svg>
  )
}
