import { ReactNode, CSSProperties } from 'react';

export type ChipVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type ChipSize = 'sm' | 'md';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

const variantStyles: Record<ChipVariant, CSSProperties> = {
  default: { backgroundColor: 'var(--dark-surface)', color: 'var(--text-secondary)', border: '1px solid var(--dark-border)' },
  primary: { backgroundColor: 'var(--coral-400)', color: 'white' },
  success: { backgroundColor: 'var(--success)', color: 'white' },
  warning: { backgroundColor: 'var(--warning)', color: 'white' },
  error: { backgroundColor: 'var(--error)', color: 'white' },
  info: { backgroundColor: 'var(--info)', color: 'white' },
};

const Chip = ({ label, variant = 'default', size = 'md', icon, selected, onClick }: ChipProps) => {
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: size === 'sm' ? '4px 8px' : '6px 12px',
    borderRadius: 'var(--radius-full)',
    fontSize: size === 'sm' ? '12px' : '14px',
    fontWeight: 500,
    transition: 'all var(--transition-base)',
    cursor: onClick ? 'pointer' : 'default',
    ...variantStyles[variant],
    ...(selected && variant === 'default' && { backgroundColor: 'var(--dark-hover)', color: 'var(--text-primary)' }),
  };

  return (
    <div style={style} onClick={onClick}>
      {icon && <span style={{ flexShrink: 0 }}>{icon}</span>}
      <span>{label}</span>
    </div>
  );
};

export default Chip;
