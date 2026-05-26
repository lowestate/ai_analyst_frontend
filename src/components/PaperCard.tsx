import React from 'react';
import './RetroTheme.css';

interface PaperCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  active?: boolean;
  hoverScaleColor?: string; // e.g. for custom border highlight on hover
}

export const PaperCard: React.FC<PaperCardProps> = ({
  children,
  interactive = false,
  active = false,
  hoverScaleColor,
  style,
  className = '',
  ...props
}) => {
  const [hovered, setHovered] = React.useState(false);

  const activeStyles: React.CSSProperties = active
    ? {
        border: '2px solid var(--primary-color)',
        boxShadow: '0 4px 12px rgba(112, 72, 232, 0.08)',
      }
    : {
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-paper)',
      };

  const interactiveStyles: React.CSSProperties = interactive
    ? {
        cursor: 'pointer',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered 
          ? (active ? '0 12px 28px rgba(112, 72, 232, 0.15)' : '0 12px 24px rgba(0,0,0,0.06)')
          : (active ? '0 4px 12px rgba(112, 72, 232, 0.08)' : 'var(--shadow-paper)'),
        transition: 'all 0.2s ease',
      }
    : {};

  return (
    <div
      className={`paper-card ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
        backgroundColor: 'var(--card-bg)',
        ...activeStyles,
        ...interactiveStyles,
        ...style,
      }}
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => interactive && setHovered(false)}
      {...props}
    >
      {children}
    </div>
  );
};
