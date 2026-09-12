import React from 'react';

type EditorialHeroHeadingProps = {
  setup: string;
  emphasis: string;
  className?: string;
  align?: 'center' | 'left';
};

export const EditorialHeroHeading: React.FC<EditorialHeroHeadingProps> = ({
  setup,
  emphasis,
  className = '',
  align = 'center',
}) => {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';

  return (
    <h1 className={`${alignClass} text-balance text-white ${className}`}>
      <span className="hero-line block">{setup}</span>
      <span className="hero-emphasis mt-1 block sm:mt-2">{emphasis}</span>
    </h1>
  );
};

export default EditorialHeroHeading;
