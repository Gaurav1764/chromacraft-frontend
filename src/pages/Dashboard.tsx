import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Palette, Image as ImageIcon } from 'lucide-react';
import { getSavedPalettes } from '../utils/storage';
import type { Palette as PaletteType } from '../types';
import PaletteDisplay from '../components/PaletteDisplay';
import { useAuth } from '@clerk/clerk-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [savedCount, setSavedCount] = useState(0);
  const [recentPalette, setRecentPalette] = useState<PaletteType | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchPalettes = async () => {
      const token = await getToken();
      const palettes = await getSavedPalettes(token);
      setSavedCount(palettes.length);
      if (palettes.length > 0) {
        setRecentPalette(palettes[0]);
      }
    };
    fetchPalettes();
  }, [getToken]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <span className="eyebrow">// OVERVIEW</span>
        <h1>Welcome to ChromaCraft</h1>
        <p className="subtitle">Your ultimate color palette toolkit</p>
      </header>

      <div className="dashboard-grid">
        <div className="card stat-card">
          <h3>Saved Palettes</h3>
          <div className="stat-value">{savedCount}</div>
          <Link to="/saved" className="btn btn-secondary">
            View All <ArrowRight size={20} strokeWidth={3} />
          </Link>
        </div>

        <div className="card action-card">
          <Palette size={48} strokeWidth={2.5} className="action-icon" />
          <h3>Create a Palette</h3>
          <p>Generate beautiful color combinations based on harmony rules.</p>
          <Link to="/generate" className="btn btn-primary">
            Open Generator
          </Link>
        </div>

        <div className="card action-card">
          <ImageIcon size={48} strokeWidth={2.5} className="action-icon" />
          <h3>Extract from Image</h3>
          <p>Find the dominant colors from any image instantly.</p>
          <Link to="/extract" className="btn btn-primary">
            Open Extractor
          </Link>
        </div>
      </div>

      {recentPalette && (
        <div className="recent-section">
          <span className="eyebrow">// LATEST ARCHIVE ENTRY</span>
          <div className="recent-palette-header">
            <h3>{recentPalette.name}</h3>
            <span className="eyebrow date-tag">
              {new Date(recentPalette.createdDate).toLocaleDateString()}
            </span>
          </div>
          <PaletteDisplay 
            colors={recentPalette.colors.map(hex => ({ hex }))} 
            format="HEX" 
            className="small-palette"
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
