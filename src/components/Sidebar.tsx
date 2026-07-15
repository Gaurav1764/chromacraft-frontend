import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Palette, Image as ImageIcon, Bookmark } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '@clerk/clerk-react';
import { migrateGuestPalettes } from '../utils/storage';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    const runMigration = async () => {
      if (isLoaded && isSignedIn) {
        const token = await getToken();
        if (token) {
          await migrateGuestPalettes(token);
        }
      }
    };
    runMigration();
  }, [isLoaded, isSignedIn, getToken]);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>ChromaCraft</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={24} strokeWidth={3} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/generate" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Palette size={24} strokeWidth={3} />
          <span>Generator</span>
        </NavLink>
        <NavLink to="/extract" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ImageIcon size={24} strokeWidth={3} />
          <span>Extractor</span>
        </NavLink>
        <NavLink to="/saved" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Bookmark size={24} strokeWidth={3} />
          <span>Saved Palettes</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-auth">
        {!isLoaded && (
          <div className="auth-container" style={{ opacity: 0.7 }}>
            <p className="eyebrow" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>AUTH LOADING...</p>
            <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--paper)' }}>
              If this takes too long, your network or adblocker is blocking the login service.
            </p>
          </div>
        )}
        <SignedIn>
          <div className="auth-container">
            <UserButton 
              showName 
              appearance={{
                variables: {
                  colorText: '#F3F0E8', 
                  fontFamily: 'Archivo, sans-serif'
                }
              }}
            />
          </div>
        </SignedIn>
        <SignedOut>
          <div className="auth-container">
            <SignInButton mode="modal">
              <button className="btn btn-primary" style={{ width: '100%' }}>Sign In</button>
            </SignInButton>
            <p className="eyebrow" style={{ marginTop: '0.5rem', textAlign: 'center' }}>GUEST MODE</p>
          </div>
        </SignedOut>
      </div>
    </aside>
  );
};

export default Sidebar;
