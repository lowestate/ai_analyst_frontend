import React from 'react';
import { PaperCard } from './PaperCard';
import { RetroStamp } from './RetroStamp';
import './RetroTheme.css';

interface SpecialistCardProps {
  moduleNum: string;
  moduleTitle: string;
  avatar: string;
  avatarName: string;
  employeeName: string;
  employeeRole: string;
  description: string;
  bullets: string[];
  employeeId: string;
  isActive?: boolean;
  onClick: () => void;
}

export const SpecialistCard: React.FC<SpecialistCardProps> = ({
  moduleNum,
  moduleTitle,
  avatar,
  avatarName,
  employeeName,
  employeeRole,
  description,
  bullets,
  employeeId,
  isActive = false,
  onClick,
}) => {
  const accentColor = isActive ? 'var(--primary-color)' : 'var(--muted-fg)';
  const borderPillColor = isActive ? 'var(--primary-color)' : 'var(--border-color)';
  const badgeColor = isActive ? 'var(--primary-color)' : 'oklch(0.22 0.04 250)';
  
  return (
    <PaperCard
      active={isActive}
      interactive={true}
      onClick={onClick}
      style={{
        padding: '28px',
      }}
    >
      {/* Card Header tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          border: `1px solid ${borderPillColor}`,
          backgroundColor: 'var(--card-bg)',
          borderRadius: '16px',
          fontSize: '9px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 'bold',
          color: isActive ? 'var(--primary-color)' : 'var(--muted-fg)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <span style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            backgroundColor: isActive ? 'var(--primary-color)' : 'var(--border-color)', 
            display: 'inline-block' 
          }} className={isActive ? 'animate-pulse' : ''}></span>
          MODULE {moduleNum} / {moduleTitle}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: accentColor }}></div>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: accentColor }}></div>
        </div>
      </div>

      {/* Avatar and Title Row */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {/* Photo Print Box */}
        <div style={{
          width: '90px',
          height: '90px',
          border: `2px solid ${isActive ? 'var(--primary-color)' : '#3399FF'}`,
          backgroundColor: '#f1f5f9',
          position: 'relative',
          flexShrink: 0,
          boxShadow: `2px 2px 0px ${isActive ? 'rgba(112, 72, 232, 0.2)' : 'rgba(51, 153, 255, 0.2)'}`
        }}>
          <img src={avatar} alt={employeeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: badgeColor,
            color: '#ffffff',
            textAlign: 'center',
            fontSize: '8px',
            fontWeight: 'bold',
            padding: '2px 0',
            letterSpacing: '0.1em',
            fontFamily: 'var(--font-mono)'
          }}>{avatarName}</div>
        </div>

        <div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--fg-color)', letterSpacing: '-0.02em' }}>{employeeName}</h3>
          <div className="font-mono" style={{ fontSize: '9px', color: isActive ? 'var(--primary-color)' : 'var(--muted-fg)', marginTop: '4px', letterSpacing: '0.02em', fontWeight: 'bold' }}>
            {employeeRole}
          </div>
        </div>
      </div>

      {/* Dashed line */}
      <div style={{ borderTop: '1px dashed var(--border-color)', margin: '20px 0' }}></div>

      {/* Description */}
      <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--muted-fg)', margin: '0 0 20px 0' }}>
        {description}
      </p>

      {/* Bullet points list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {bullets.map((bullet, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px', color: 'var(--fg-color)' }}>
            <span style={{ color: isActive ? 'var(--primary-color)' : '#3399FF', fontSize: '10px', marginTop: '2px' }}>▶</span>
            <span>{bullet}</span>
          </div>
        ))}
      </div>

      {/* Footer ID and Stamp */}
      <div style={{ marginTop: 'auto', paddingTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span className="font-mono" style={{ fontSize: '10px', color: isActive ? 'var(--primary-color)' : 'var(--muted-fg)', fontWeight: 'bold' }}>
          {employeeId}
        </span>
        <RetroStamp text="APPROVED" color={isActive ? 'var(--primary-color)' : '#3399FF'} borderColor={isActive ? 'var(--primary-color)' : '#3399FF'} />
      </div>
    </PaperCard>
  );
};
