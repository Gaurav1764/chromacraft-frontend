import type { Palette } from '../types';

const STORAGE_KEY = 'color_palettes';
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Internal helper for guest mode
const getGuestPalettes = (): Palette[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const getSavedPalettes = async (token?: string | null): Promise<Palette[]> => {
  if (!token) {
    return getGuestPalettes();
  }
  
  try {
    const res = await fetch(`${API_BASE}/api/palettes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch palettes');
    return await res.json();
  } catch (e) {
    console.error('Failed to get saved palettes', e);
    return [];
  }
};

export const savePalette = async (palette: Omit<Palette, 'id' | 'createdDate'>, token?: string | null): Promise<Palette | null> => {
  if (!token) {
    const palettes = getGuestPalettes();
    const newPalette: Palette = {
      ...palette,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      createdDate: Date.now(),
    };
    palettes.unshift(newPalette);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
    return newPalette;
  }

  try {
    const res = await fetch(`${API_BASE}/api/palettes`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(palette)
    });
    if (!res.ok) throw new Error('Failed to save palette');
    return await res.json();
  } catch (e) {
    console.error('Failed to save palette', e);
    return null;
  }
};

export const deletePalette = async (id: string, token?: string | null): Promise<boolean> => {
  if (!token) {
    const palettes = getGuestPalettes();
    const updated = palettes.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  }

  try {
    const res = await fetch(`${API_BASE}/api/palettes/${id}`, { 
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete palette', e);
    return false;
  }
};

export const migrateGuestPalettes = async (token: string): Promise<void> => {
  const guestPalettes = getGuestPalettes();
  if (guestPalettes.length === 0) return;

  for (const palette of guestPalettes) {
    try {
      await fetch(`${API_BASE}/api/palettes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: palette.name, colors: palette.colors })
      });
    } catch (e) {
      console.error('Failed to migrate palette:', palette.name, e);
    }
  }

  // Clear local storage after successful migration attempt
  localStorage.removeItem(STORAGE_KEY);
};
