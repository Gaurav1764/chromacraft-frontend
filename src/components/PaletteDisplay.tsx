import React from 'react';
import ColorSwatch from './ColorSwatch';
import './PaletteDisplay.css';

export interface ColorData {
  hex: string;
  locked?: boolean;
}

interface PaletteDisplayProps {
  colors: ColorData[];
  format: 'HEX' | 'RGB' | 'HSL';
  onToggleLock?: (index: number) => void;
  className?: string;
}

const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ 
  colors, 
  format, 
  onToggleLock,
  className = ''
}) => {
  return (
    <div className={`palette-display-wrapper ${className}`}>
      <div className="proof-label">
        PROOF SHEET &middot; {colors.length} COLORS
      </div>
      <div className="palette-display">
        {/* Registration Marks */}
        <div className="reg-mark top-left">+</div>
        <div className="reg-mark top-right">+</div>
        <div className="reg-mark bottom-left">+</div>
        <div className="reg-mark bottom-right">+</div>
        
        <div className="swatches-container">
          {colors.map((color, index) => (
            <ColorSwatch
              key={`${index}-${color.hex}`}
              hex={color.hex}
              format={format}
              locked={color.locked}
              onToggleLock={onToggleLock ? () => onToggleLock(index) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaletteDisplay;
