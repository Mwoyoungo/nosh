import { InputHTMLAttributes, ReactNode, forwardRef, CSSProperties } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  backgroundColor: 'var(--dark-surface)',
  border: '1px solid var(--dark-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontSize: '16px',
  outline: 'none',
  transition: 'all var(--transition-base)',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: fullWidth ? '100%' : 'auto' }}>
        {label && (
          <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}

        <div style={{ position: 'relative' }}>
          {leftIcon && (
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            style={{
              ...inputStyle,
              paddingLeft: leftIcon ? '44px' : '16px',
              paddingRight: rightIcon ? '44px' : '16px',
              borderColor: error ? 'var(--error)' : 'var(--dark-border)',
              ...style
            }}
            {...props}
          />

          {rightIcon && (
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <span style={{ fontSize: '14px', color: 'var(--error)' }}>{error}</span>
        )}

        {helperText && !error && (
          <span style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
