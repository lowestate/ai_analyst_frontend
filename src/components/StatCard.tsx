import React from 'react';
import { PaperCard } from './PaperCard';

interface StatCardProps {
  value: string;
  label: string;
}

export const StatCard: React.FC<StatCardProps> = ({ value, label }) => {
  return (
    <PaperCard
      style={{
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontSize: '26px',
          fontWeight: 800,
          color: 'var(--fg-color)',
          letterSpacing: '-0.02em',
          lineHeight: '1.1',
        }}
      >
        {value}
      </div>
      <div
        className="font-mono"
        style={{
          fontSize: '10px',
          color: 'var(--muted-fg)',
          marginTop: '8px',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>
    </PaperCard>
  );
};
