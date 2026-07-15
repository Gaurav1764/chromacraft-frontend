import React, { useState } from 'react';
import { formatColor } from '../utils/colorUtils';
import './ColorSwatch.css';

interface ColorSwatchProps {
  hex: string;
  format: 'HEX' | 'RGB' | 'HSL';
  locked?: boolean;
  onToggleLock?: () => void;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ hex, format, locked, onToggleLock }) => {
  const [copied, setCopied] = useState(false);
  const displayValue = formatColor(hex, format);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(displayValue);
      setCopied(true);
      
      const event = new CustomEvent('color-copied', { detail: { color: displayValue } });
      window.dispatchEvent(event);

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy color', err);
    }
  };

  return (
    <div 
      className="color-swatch"
      onClick={handleCopy}
    >
      <div className="swatch-color-area" style={{ backgroundColor: hex }}></div>
      
      <div className="swatch-label-bar">
        <span className="swatch-value">
          {copied ? 'COPIED!' : displayValue}
        </span>
        
        {onToggleLock && (
          <button 
            className={`lock-btn ${locked ? 'is-locked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock();
            }}
            title={locked ? "Unlock color" : "Lock color"}
          >
            {/* Minimal CSS-based lock icon/box */}
          </button>
        )}
      </div>
    </div>
  );
};

export default ColorSwatch;
