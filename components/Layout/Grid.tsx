import React from "react";

type RowProps = {
  children: React.ReactNode;
  cols?: keyof typeof classes.gap;
  gap?: keyof typeof classes.cols;
};

const classes = {
  gap: {
    1: "gap-1",
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
  },
  // Collapse to a single column on mobile; apply the requested column count at md+.
  cols: {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-6",
  },
};

const Row = ({ children, cols = 2, gap = 2 }: RowProps) => {
  return (
    <div className={`grid  ${classes.cols[cols]} ${classes.gap[gap]}`}>
      {children}
    </div>
  );
};

export default Row;
