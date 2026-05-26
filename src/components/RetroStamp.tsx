import React from 'react';
import './RetroTheme.css';

interface RetroStampProps {
  text: string;
  color?: string;
  borderColor?: string;
  rotation?: number; // angle in degrees, default is -6
}

export const RetroStamp: React.FC<RetroStampProps> = ({
  text,
  color = 'var(--primary-color)',
  borderColor = 'var(--primary-color)',
  rotation = -5,
}) => {
  return (
    <div
      style={{
        border: `2px solid ${borderColor}`,
        color: color,
        padding: '2px 8px',
        fontFamily: 'var(--font-mono)',
        fontWeight: 'bold',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        transform: `rotate(${rotation}deg)`,
        display: 'inline-block',
        fontSize: '10px',
        backgroundColor: color.startsWith('var') 
          ? `rgba(112, 72, 232, 0.05)` 
          : `${color}0d`, // subtle translucency
      }}
    >
      {text}
    </div>
  );
};
