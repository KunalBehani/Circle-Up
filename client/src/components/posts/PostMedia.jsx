
import React from 'react';

export const PostMedia = ({ media = [], detail = false }) => {
  if (!Array.isArray(media) || media.length === 0) {
    return null;
  }

  return (
    <div
      className={`grid gap-2 mb-4 ${
        media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
      }`}
    >
      {media.map((item, index) => {
        if (!item?.url) return null;

        if (item.type === 'video') {
          return (
            <video
              key={item.publicId || item.url || index}
              src={item.url}
              controls
              playsInline
              preload="metadata"
              className={`w-full rounded-xl bg-black object-contain ${
                detail ? 'max-h-[650px]' : 'max-h-[400px]'
              }`}
            >
              Your browser does not support video playback.
            </video>
          );
        }

        return (
          <a
            key={item.publicId || item.url || index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-xl bg-neutral-100"
          >
            <img
              src={item.url}
              alt={`Post attachment ${index + 1}`}
              loading="lazy"
              className={`w-full object-contain ${
                detail ? 'max-h-[650px]' : 'max-h-[400px]'
              }`}
            />
          </a>
        );
      })}
    </div>
  );
};
