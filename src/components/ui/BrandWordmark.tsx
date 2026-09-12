import React from 'react';

type BrandWordmarkProps = {
  variant?: 'light' | 'dark';
  className?: string;
  as?: 'span' | 'a' | 'div';
  href?: string;
};

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  variant = 'light',
  className = '',
  as = 'span',
  href,
}) => {
  const color = variant === 'light' ? 'text-white' : 'text-ink';
  const classes = `font-logo text-[30px] leading-none tracking-tight sm:text-[38px] lg:text-[44px] ${color} ${className}`;

  if (as === 'a' || href) {
    return (
      <a href={href ?? '#'} className={classes} aria-label="MoneyPilot home">
        moneypilot
      </a>
    );
  }

  const Tag = as;
  return <Tag className={classes}>moneypilot</Tag>;
};

export default BrandWordmark;
