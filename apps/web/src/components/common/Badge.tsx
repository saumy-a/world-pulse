import type { FC } from 'react';
import { getEventColor } from '../../utils/geo';

interface BadgeProps {
  label: string;
  category?: string;
  source?: string;
  size?: 'sm' | 'md';
}

export const Badge: FC<BadgeProps> = ({ label, category, source, size = 'sm' }) => {
  const color = getEventColor(category, source);

  return (
    <span
      className="inline-flex items-center uppercase tracking-wider"
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: size === 'sm' ? '8px' : '9px',
        fontWeight: 600,
        letterSpacing: '1.2px',
        padding: size === 'sm' ? '2px 7px' : '3px 9px',
        border: `1px solid ${color}48`,
        background: `${color}0f`,
        color: color,
        borderRadius: '1px',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        className="rounded-full mr-1.5"
        style={{ width: '4px', height: '4px', background: color, flexShrink: 0, boxShadow: `0 0 4px ${color}` }}
      />
      {label}
    </span>
  );
};
