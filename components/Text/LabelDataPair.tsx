import React from "react";

const classes = {
  displayType: {
    default: 'font-inter',
    badge: 'badge'
  },
  badgeColor: {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    info: 'badge-info',
  },
  textCase: {
    default: '',
    capitalize: 'capitalize'
  }
};

const LabelDataPair = ({
  label,
  data,
  children,
  tooltip,
  displayType = 'default',
  badgeColor = 'primary',
  textCase = 'default',
  onClick,

}: {
  label?: string;
  data?: string | number;
  children?: React.ReactNode;
  tooltip?: string;
  displayType?: keyof typeof classes.displayType;
  badgeColor?: keyof typeof classes.badgeColor;
  textCase?: keyof typeof classes.textCase;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}) => {

  const containerClasses = `
        flex justify-between border-b items-center 
        border-dotted border-b-base-content/60 
        rounded-tr-xl rounded-tl-xl py-1 px-2
        ${onClick ? 'hover:cursor-pointer hover:bg-secondary/30' : ''}
    `;

  return (
    <div className={containerClasses} onClick={onClick}>
      <div className="tooltip tooltip-right" data-tip={tooltip || label}>
        <label className={`font- font-medium text-lg text-base-content ${onClick ? 'hover:cursor-pointer' : ''}`}>
          {label || children}
        </label>
      </div>
      <div className={`${classes.displayType[displayType]} ${classes.textCase[textCase]} ${displayType === 'badge' ? `${classes.badgeColor[badgeColor]} badge-lg` : ''}`}>
        {data || children}
      </div>
    </div >
  );
};

export default LabelDataPair;

