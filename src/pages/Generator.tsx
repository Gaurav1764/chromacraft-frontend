import React, { useState, useEffect } from 'react';
import { RefreshCw, Save } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { generatePalette, getRandomColor } from '../utils/colorUtils';
import type { Harmony } from '../utils/colorUtils';
import { savePalette } from '../utils/storage';
import { useAuth } from '@clerk/clerk-react';
import PaletteDisplay from '../components/PaletteDisplay';
import type { ColorData } from '../components/PaletteDisplay';
import './Generator.css';

const Generator: React.FC = () => {
  const [colors, setColors] = useState<ColorData[]>([]);
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState<'HEX' | 'RGB' | 'HSL'>('HEX');
  const [harmony, setHarmony] = useState<Harmony>('random');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [paletteName, setPaletteName] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (location.state?.loadPalette) {
      const loadedColors = location.state.loadPalette as string[];
      setColors(loadedColors.map(hex => ({ hex, locked: false })));
      setCount(loadedColors.length);
      window.history.replaceState({}, document.title);
    } else {
      handleGenerate(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (colors.length > 0 && colors.length !== count) {
      handleGenerate(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, harmony]);

  const handleGenerate = (forceAll = false) => {
    let newColors: ColorData[] = [];
    if (!forceAll && colors.length === count) {
      const baseColor = colors.find(c => !c.locked)?.hex || getRandomColor();
      const generated = generatePalette(baseColor, count, harmony);
      newColors = colors.map((c, i) => 
        c.locked ? c : { hex: generated[i] || getRandomColor(), locked: false }
      );
    } else {
      const baseColor = getRandomColor();
      const generated = generatePalette(baseColor, count, harmony);
      newColors = generated.map(hex => ({ hex, locked: false }));
    }
    setColors(newColors);
  };

  const toggleLock = (index: number) => {
    setColors(prev => {
      const newColors = [...prev];
      newColors[index] = { ...newColors[index], locked: !newColors[index].locked };
      return newColors;
    });
  };

  const { getToken, isLoaded, isSignedIn } = useAuth();

  const handleSave = async () => {
    if (!paletteName.trim()) return;
    
    let token = null;
    if (isLoaded && isSignedIn) {
      try {
        token = await getToken();
      } catch (e) {
        console.error('Failed to get token:', e);
      }
    }
    
    await savePalette({
      name: paletteName,
      colors: colors.map(c => c.hex)
    }, token);
    setShowSaveModal(false);
    setPaletteName('');
    
    // Dispatch event to show toast
    const event = new CustomEvent('color-copied', { detail: { color: 'Palette Saved' } });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [colors, count, harmony]);

  return (
    <div className="generator">
      <header className="page-header">
        <div className="title-area">
          <span className="eyebrow">// RANDOM COLOR SYSTEM</span>
          <h1>Palette Generator</h1>
          <p className="subtitle">Press spacebar to generate new colors</p>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => handleGenerate()}>
            <RefreshCw size={24} strokeWidth={3} /> Generate
          </button>
          <button className="btn btn-primary" onClick={() => setShowSaveModal(true)}>
            <Save size={24} strokeWidth={3} /> Save
          </button>
        </div>
      </header>

      <div className="controls-panel">
        <div className="control-group">
          <label className="eyebrow">Colors: {count}</label>
          <input 
            type="range" 
            min="2" 
            max="10" 
            value={count} 
            onChange={(e) => setCount(parseInt(e.target.value))} 
          />
        </div>
        
        <div className="control-group">
          <label className="eyebrow">Harmony</label>
          <select 
            value={harmony} 
            onChange={(e) => setHarmony(e.target.value as Harmony)}
            className="select-input"
          >
            <option value="random">Random</option>
            <option value="analogous">Analogous</option>
            <option value="complementary">Complementary</option>
            <option value="triadic">Triadic</option>
            <option value="monochromatic">Monochromatic</option>
          </select>
        </div>

        <div className="control-group">
          <label className="eyebrow">Format</label>
          <div className="format-toggle">
            {(['HEX', 'RGB', 'HSL'] as const).map(f => (
              <button 
                key={f}
                className={`toggle-btn ${format === f ? 'active' : ''}`}
                onClick={() => setFormat(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <PaletteDisplay 
        colors={colors} 
        format={format} 
        onToggleLock={toggleLock} 
        className="main-palette"
      />

      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Save Palette</h2>
            <div className="modal-body">
              <input 
                type="text" 
                placeholder="E.G., OCEAN BLUES" 
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowSaveModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generator;
