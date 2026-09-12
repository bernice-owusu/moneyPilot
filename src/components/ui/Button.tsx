import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'on-blue';
type ButtonSize = 'md' | 'lg';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-ink text-white hover:bg-[#292929] hover:-translate-y-px focus-visible:outline-white',
  secondary:
    'bg-white text-ink border border-ink/10 hover:bg-paper focus-visible:outline-ink',
  ghost:
    'bg-transparent text-white border border-white/40 hover:bg-white/10 focus-visible:outline-white',
  'on-blue':
    'bg-ink text-white hover:bg-[#292929] hover:-translate-y-px focus-visible:outline-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-12 px-6 text-sm',
  lg: 'h-[52px] px-7 text-[15px]',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
