"use client";
import { useState, useRef } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [current, setCurrent] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [zooming, setZooming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasImages = images.length > 0;

  const next = () => setCurrent((c) => (c + 1) % images.length);
  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div>
      <div
        ref={containerRef}
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
        className="aspect-square bg-[#DCD4BF] relative overflow-hidden cursor-zoom-in"
      >
        {hasImages ? (
          <Image
            src={images[current]}
            alt={productName}
            fill
            className="object-cover transition-transform duration-150"
            style={
              zooming
                ? {
                    transform: "scale(2)",
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }
                : undefined
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[13px] text-mud text-center p-8">
            [nessuna foto]
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-9 h-9 flex items-center justify-center text-loden-deep text-lg z-10"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-9 h-9 flex items-center justify-center text-loden-deep text-lg z-10"
            >
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-16 h-16 relative border-2 flex-shrink-0 ${
                current === i ? "border-rust" : "border-canvas-deep"
              }`}
            >
              <Image src={img} alt={`${productName} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}