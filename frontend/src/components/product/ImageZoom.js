'use client';
import { useState, useRef } from 'react';

export default function ImageZoom({ src, alt }) {
  const [zoomed, setZoomed] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden cursor-crosshair rounded bg-white border border-gray-100"
      style={{ aspectRatio: '1/1' }}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain transition-transform duration-100"
        style={{
          transform: zoomed ? 'scale(2.2)' : 'scale(1)',
          transformOrigin: `${pos.x}% ${pos.y}%`
        }}
        onError={e => { e.target.src = 'https://via.placeholder.com/600'; }}
      />
      {!zoomed && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
          🔍 Hover to zoom
        </div>
      )}
    </div>
  );
}