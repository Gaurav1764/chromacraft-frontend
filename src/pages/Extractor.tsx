import React, { useState, useRef } from 'react';
import { Upload, Save } from 'lucide-react';
import { savePalette } from '../utils/storage';
import PaletteDisplay from '../components/PaletteDisplay';
import type { ColorData } from '../components/PaletteDisplay';
import { useAuth } from '@clerk/clerk-react';
import './Extractor.css';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const Extractor: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [colors, setColors] = useState<ColorData[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [colorCount, setColorCount] = useState(5);
  const [format, setFormat] = useState<'HEX' | 'RGB' | 'HSL'>('HEX');
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [paletteName, setPaletteName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImagePreview(src);
      processImage(file, colorCount);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (file: File, k: number) => {
    setIsExtracting(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('k', k.toString());

      const res = await fetch(`${API_BASE}/api/extract`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to extract colors');
      }

      const data = await res.json();
      setColors(data.colors.map((hex: string) => ({ hex, locked: false })));
    } catch (error) {
      console.error('Error during extraction:', error);
      alert('Failed to extract colors from image.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(e.target.value);
    setColorCount(newCount);
    if (selectedFile) {
      processImage(selectedFile, newCount);
    }
  };

  const { getToken, isLoaded, isSignedIn } = useAuth();

  const handleSave = async () => {
    if (!paletteName.trim() || colors.length === 0) return;
    
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
    const event = new CustomEvent('color-copied', { detail: { color: 'Palette Saved' } });
    window.dispatchEvent(event);
  };

  return (
    <div className="extractor">
      <header className="page-header">
        <div className="title-area">
          <span className="eyebrow">// PIXEL SAMPLING ENGINE</span>
          <h1>Image Extractor</h1>
          <p className="subtitle">Upload an image to extract its dominant colors</p>
        </div>
        
        {colors.length > 0 && (
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setShowSaveModal(true)}>
              <Save size={24} strokeWidth={3} /> Save Palette
            </button>
          </div>
        )}
      </header>

      <div className="extractor-content">
        <div className="upload-section">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden-input" 
          />
          
          {imagePreview ? (
            <div className="image-preview-container" onClick={() => fileInputRef.current?.click()}>
              <img src={imagePreview} alt="Upload preview" className="image-preview" />
              <div className="upload-overlay">
                <Upload size={32} strokeWidth={3} />
                <span>CLICK TO REPLACE</span>
              </div>
            </div>
          ) : (
            <div className="upload-placeholder" onClick={() => fileInputRef.current?.click()}>
              <Upload size={48} strokeWidth={2.5} className="upload-icon" />
              <h3>UPLOAD IMAGE</h3>
              <p>CLICK TO BROWSE OR DRAG & DROP HERE</p>
            </div>
          )}
        </div>

        <div className="controls-panel">
          <div className="control-group">
            <label className="eyebrow">Colors: {colorCount}</label>
            <input 
              type="range" 
              min="3" 
              max="8" 
              value={colorCount} 
              onChange={handleCountChange}
              disabled={isExtracting}
            />
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

        {isExtracting ? (
          <div className="extracting-state card">
            <h2 className="loading-text">PROCESSING...</h2>
          </div>
        ) : colors.length > 0 ? (
          <div className="extracted-palette-section">
            <PaletteDisplay 
              colors={colors} 
              format={format} 
              className="extractor-palette"
            />
          </div>
        ) : null}
      </div>

      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Save Extracted Palette</h2>
            <div className="modal-body">
              <input 
                type="text" 
                placeholder="E.G., SUNSET VIBES" 
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

export default Extractor;
