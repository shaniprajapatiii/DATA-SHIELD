import React from 'react';

export default function ScanLine() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Scan line */}
      <div
        className="absolute left-0 right-0 h-px opacity-20"
        style={{
          background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)',
          animation: 'scanLine 6s linear infinite',
          top: 0,
        }}
      />
      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-[rgba(0,245,255,0.3)]" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-[rgba(0,245,255,0.3)]" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-[rgba(0,245,255,0.3)]" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-[rgba(0,245,255,0.3)]" />
    </div>
  );
}
