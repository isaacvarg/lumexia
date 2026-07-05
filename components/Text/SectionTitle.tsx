import React from 'react';

const sizes = {
  default: "text-2xl md:text-3xl",
  normal: 'text-lg md:text-xl uppercase',
  small: "text-base uppercase"
};

const SectionTitle = ({ children, size = "default" }: { children: React.ReactNode, size?: keyof typeof sizes }) => {



  return (
    <h1 className={`${sizes[size]} font-poppins font-semibold text-cararra-800`}>{children}</h1>
  );
};

export default SectionTitle;
