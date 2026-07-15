import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [color, setColor] = useState('');

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleCopied = (e: Event) => {
      const customEvent = e as CustomEvent<{ color: string }>;
      setColor(customEvent.detail.color);
      setVisible(true);
      
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setVisible(false);
      }, 3000);
    };

    window.addEventListener('color-copied', handleCopied);
    return () => {
      window.removeEventListener('color-copied', handleCopied);
      clearTimeout(timeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="toast animate-fade-in">
      <div className="toast-color" style={{ backgroundColor: color }}></div>
      <span>Copied <strong>{color}</strong> to clipboard!</span>
    </div>
  );
};

export default Toast;
