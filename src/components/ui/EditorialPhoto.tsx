import React from 'react';

type EditorialPhotoProps = {
  src: string;
  alt: string;
  caption?: string;
  rotation?: number;
  className?: string;
  aspect?: 'square' | 'portrait';
};

export const EditorialPhoto: React.FC<EditorialPhotoProps> = ({
  src,
  alt,
  caption,
  rotation = -5,
  className = '',
  aspect = 'portrait',
}) => {
  const aspectClass = aspect === 'square' ? 'aspect-square' : 'aspect-[4/5]';

  return (
    <figure
      className={`editorial-photo group inline-block bg-white p-2.5 shadow-[0_8px_20px_rgba(20,40,70,0.12)] transition duration-200 ease-out hover:-translate-y-[3px] ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className={`${aspectClass} w-full overflow-hidden bg-soft-gray`}>
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition duration-200 ease-out group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
      {caption ? (
        <figcaption className="font-caption mt-2 px-1 text-center text-[13px] leading-tight text-ink/80">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
};

export default EditorialPhoto;
