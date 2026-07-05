import React from "react";

interface CardRootProps {
  children: React.ReactNode;
  borderColor?: keyof typeof classes.borderColor;
  borderSize?: keyof typeof classes.borderSize;
  shadow?: keyof typeof classes.shadow;
  bg?: keyof typeof classes.bg;
  type?: keyof typeof classes.type;
  span?: keyof typeof classes.span;

}

// TODO make this so you can toggle between h-full and not

const classes = {
  borderColor: {
    light: "border-base-200",
    base: ""
  },
  borderSize: {
    base: "",
    small: "border",
    old: "border-2"
  },
  shadow: {
    base: "shadow-xl",
    none: "",
  },
  bg: {
    elevated: "bg-base-300",
    base: "bg-base-100",
  },
  type: {
    old: 'rounded-lg p-6',
    dasiy: 'card'
  },
  span: {
    base: '',
    2: 'col-span-1 sm:col-span-2',
    3: 'col-span-1 sm:col-span-2 lg:col-span-3',
  }
};

const wrapper = {
  old: 'flex flex-col w-full gap-y-4 p-6',
  daisy: 'card-body flex flex-col gap-y-4'
}

const Root = ({
  children,
  borderColor = "base",
  borderSize = "base",
  shadow = "base",
  bg = "base",
  type = 'dasiy',
  span = 'base',

}: CardRootProps) => (
  <div
    className={`  ${classes.type[type]} ${classes.borderSize[borderSize]} ${classes.borderColor[borderColor]} ${classes.shadow[shadow]} ${classes.bg[bg]} ${classes.span[span]}  h-full`}
  >
    <div className={`${wrapper.daisy}`}>
      {children}
    </div>
  </div>
);

export default Root;
