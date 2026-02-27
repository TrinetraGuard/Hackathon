import { useState } from "react";

interface PlaceImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  /** Container class for the wrapper (e.g. aspect ratio, rounded) */
  containerClassName?: string;
  /** Show a placeholder when no src or image fails to load */
  placeholder?: React.ReactNode;
}

/**
 * Renders a place image with fallback: if src is missing or the image fails to load,
 * shows a placeholder so the UI never shows a broken image.
 */
export function PlaceImage({
  src,
  alt,
  className = "w-full h-full object-cover",
  containerClassName = "",
  placeholder = (
    <div className="w-full h-full flex items-center justify-center text-slate-400 text-3xl sm:text-4xl" aria-hidden>
      📍
    </div>
  ),
}: PlaceImageProps) {
  const [error, setError] = useState(false);
  const showImage = src && !error;

  return (
    <div className={containerClassName}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className={className}
          onError={() => setError(true)}
        />
      ) : (
        placeholder
      )}
    </div>
  );
}
