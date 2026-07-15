import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ExternalLink } from 'lucide-react';
import { getSavedPalettes, deletePalette } from '../utils/storage';
import type { Palette } from '../types';
import PaletteDisplay from '../components/PaletteDisplay';
import { useAuth } from '@clerk/clerk-react';
import './SavedPalettes.css';

const SavedPalettes: React.FC = () => {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const navigate = useNavigate();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    loadPalettes();
  }, [isLoaded, isSignedIn, getToken]);

  const loadPalettes = async () => {
    let token = null;
    if (isLoaded && isSignedIn) {
      try {
        token = await getToken();
      } catch (e) {
        console.error('Failed to get token:', e);
      }
    }
    const data = await getSavedPalettes(token);
    setPalettes(data);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      let token = null;
      if (isLoaded && isSignedIn) {
        try {
          token = await getToken();
        } catch (e) {
          console.error('Failed to get token:', e);
        }
      }
      await deletePalette(id, token);
      loadPalettes();
    }
  };

  const handleOpenGenerator = (palette: Palette) => {
    navigate('/generate', { state: { loadPalette: palette.colors } });
  };

  return (
    <div className="saved-palettes">
      <header className="page-header">
        <div className="title-area">
          <span className="eyebrow">// ARCHIVE</span>
          <h1>Saved Palettes</h1>
          <p className="subtitle">Your personal collection of color schemas</p>
        </div>
      </header>

      {palettes.length === 0 ? (
        <div className="empty-state">
          <div className="stamp-badge">
            NONE SAVED YET
          </div>
          <p>Go to the Generator or Extractor to save some palettes!</p>
        </div>
      ) : (
        <div className="palettes-grid">
          {palettes.map((palette) => (
            <div key={palette.id} className="palette-card card">
              <div className="palette-card-header">
                <div>
                  <h3>{palette.name}</h3>
                  <span className="eyebrow date-tag">
                    {new Date(palette.createdDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="palette-card-actions">
                  <button 
                    className="btn-icon" 
                    onClick={() => handleOpenGenerator(palette)}
                    title="Open in Generator"
                  >
                    <ExternalLink size={20} strokeWidth={3} />
                  </button>
                  <button 
                    className="btn-icon danger-icon" 
                    onClick={() => handleDelete(palette.id, palette.name)}
                    title="Delete Palette"
                  >
                    <Trash2 size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>
              
              <PaletteDisplay 
                colors={palette.colors.map(hex => ({ hex }))} 
                format="HEX" 
                className="saved-palette-display"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPalettes;
