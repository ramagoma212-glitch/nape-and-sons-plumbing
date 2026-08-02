/** Read-only public gallery grid for a project's additional media (used when
 *  a project has more than one photo/video). Videos never autoplay and never
 *  autoplay with sound. */
export default function MediaGallery({ media, projectTitle }) {
  if (!media || media.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {media.map((item) => (
        <div key={item.id} className="aspect-video overflow-hidden rounded-xl bg-navy/5">
          {item.media_type === 'video' ? (
            <video
              src={item.public_url}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            >
              Your browser does not support embedded video.
            </video>
          ) : (
            <img
              src={item.public_url}
              alt={item.caption || projectTitle}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          )}
        </div>
      ))}
    </div>
  )
}
