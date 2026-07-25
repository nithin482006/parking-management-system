import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, style }) => {
  const glassStyle: React.CSSProperties = {
    background: 'rgba(30, 41, 59, 0.4)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(148, 163, 184, 0.15)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
    ...style,
  };

  return (
    <div
      className={`rounded-3xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 ${className}`}
      style={glassStyle}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface GlassNavProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassNav: React.FC<GlassNavProps> = ({ children, className = '' }) => {
  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.4)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
  };

  return (
    <div className={`border-b ${className}`} style={glassStyle}>
      {children}
    </div>
  );
};

interface StatCardProps {
  children: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ children, className = '' }) => {
  const glassStyle: React.CSSProperties = {
    background: 'rgba(30, 41, 59, 0.4)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(148, 163, 184, 0.15)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
    position: 'relative',
  };

  return (
    <div
      className={`rounded-3xl p-6 ${className}`}
      style={glassStyle}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent)',
        }}
      />
      {children}
    </div>
  );
};
