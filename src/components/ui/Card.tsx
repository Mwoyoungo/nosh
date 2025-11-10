import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingMap = {
  none: '0',
  sm: '12px',
  md: '16px',
  lg: '24px',
};

const Card = ({ children, padding = 'md', onClick }: CardProps) => {
  const style: CSSProperties = {
    backgroundColor: 'var(--dark-card)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--dark-border)',
    padding: paddingMap[padding],
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all var(--transition-base)',
  };

  return <div style={style} onClick={onClick}>{children}</div>;
};

export default Card;
