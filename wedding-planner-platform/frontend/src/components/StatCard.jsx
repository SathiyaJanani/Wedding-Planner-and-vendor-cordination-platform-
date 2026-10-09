import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color }) {
  return (
    <div className="stat-card">
      {Icon && (
        <div className="stat-icon" style={color ? { background: `${color}15`, color: color } : {}}>
          <Icon size={26} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="stat-label">{title}</div>
        <div className="stat-val">{value}</div>
        {subtitle && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {subtitle}
          </div>
        )}
      </div>
      {trend && (
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-success)', alignSelf: 'flex-start' }}>
          {trend}
        </div>
      )}
    </div>
  );
}
