import React, { useRef, useState } from 'react';
import { Camera, X, ZoomIn } from 'lucide-react';
import { resizeAndEncodeImage } from '@/utils/imageUtils';
import type { JobPhotos } from '@/types';

interface PhotoUploadProps {
  photos?: JobPhotos;
  onChange: (photos: JobPhotos) => void;
  disabled?: boolean;
  labelBefore?: string;
  labelAfter?: string;
}

export function PhotoUpload({ photos = {}, onChange, disabled, labelBefore = 'Before', labelAfter = 'After' }: PhotoUploadProps) {
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef  = useRef<HTMLInputElement>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [loading, setLoading] = useState<'before' | 'after' | null>(null);

  const handleFile = async (side: 'before' | 'after', file: File) => {
    setLoading(side);
    try {
      const dataUrl = await resizeAndEncodeImage(file);
      onChange({ ...photos, [side]: dataUrl });
    } finally {
      setLoading(null);
    }
  };

  const clearPhoto = (side: 'before' | 'after') => {
    const next = { ...photos };
    delete next[side];
    onChange(next);
  };

  const PhotoSlot = ({ side, label, inputRef }: { side: 'before' | 'after'; label: string; inputRef: React.RefObject<HTMLInputElement | null> }) => {
    const url = photos[side];
    const isLoading = loading === side;

    return (
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</div>
        {url ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-[4/3]">
            <img src={url} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity bg-black/30">
              <button
                onClick={() => setLightbox(url)}
                className="p-1.5 bg-white/90 rounded-lg"
                title="View"
              >
                <ZoomIn size={14} className="text-[#0D1B4E]" />
              </button>
              {!disabled && (
                <button
                  onClick={() => clearPhoto(side)}
                  className="p-1.5 bg-white/90 rounded-lg"
                  title="Remove"
                >
                  <X size={14} className="text-red-500" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => !disabled && inputRef.current?.click()}
            disabled={disabled || isLoading}
            className={`w-full aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all ${
              disabled
                ? 'border-gray-100 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 bg-gray-50 hover:border-[#1DC8FF] hover:bg-blue-50/30 cursor-pointer'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#1DC8FF] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Camera size={18} className={disabled ? 'text-gray-200' : 'text-gray-400'} />
                <span className={`text-[10px] font-medium ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>
                  {disabled ? 'No photo' : 'Tap to add'}
                </span>
              </>
            )}
          </button>
        )}
        {!disabled && (
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(side, file);
              e.target.value = '';
            }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex gap-3">
        <PhotoSlot side="before" label={labelBefore} inputRef={beforeRef} />
        <PhotoSlot side="after"  label={labelAfter}  inputRef={afterRef} />
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full"
            onClick={() => setLightbox(null)}
          >
            <X size={22} className="text-white" />
          </button>
          <img
            src={lightbox}
            alt="Photo"
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
