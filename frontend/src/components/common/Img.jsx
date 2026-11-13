import React, { useState } from 'react';

const FALLBACK_IMAGE = '/placeholder-material.svg';

export default function Img({
  src,
  alt = 'BuildMart construction material',
  width,
  height,
  aspectRatio = '1',
  priority = false,
  className = '',
  style = {},
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);
  const [hasError, setHasError] = useState(false);

  // If using Cloudinary image, generate srcset variants
  const isCloudinary = typeof imgSrc === 'string' && imgSrc.includes('res.cloudinary.com');

  const generateCloudinarySrcSet = (url) => {
    if (!isCloudinary) return undefined;
    const widths = [320, 480, 640, 800, 1024];
    return widths
      .map(w => {
        // Insert Cloudinary dynamic transformation flags
        const transformed = url.replace(
          /\/upload\/(?:v\d+\/)?/,
          `/upload/f_auto,q_auto,w_${w},c_limit/`
        );
        return `${transformed} ${w}w`;
      })
      .join(', ');
  };

  const srcSet = isCloudinary ? generateCloudinarySrcSet(imgSrc) : undefined;

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(FALLBACK_IMAGE);
    }
  };

  return (
    <img
      src={imgSrc || FALLBACK_IMAGE}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : 'auto'}
      onError={handleError}
      className={`buildmart-optimized-img ${className}`}
      style={{
        aspectRatio,
        objectFit: 'cover',
        ...style
      }}
      {...props}
    />
  );
}

