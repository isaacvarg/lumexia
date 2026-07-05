import React from 'react';

const classes = {
  color: {
    default: 'text-base-content',
    soft: 'text-base-content/50',
  }
}

const PageTitle: React.FC<{ title?: string, children?: React.ReactNode, color?: keyof typeof classes.color }> = ({ title, children, color = 'default' }) => {
  return (
    <h1 className={`text-3xl md:text-4xl font-poppins font-semibold ${classes.color[color]}`}>{title || children}</h1>
  );
};

export default PageTitle;
