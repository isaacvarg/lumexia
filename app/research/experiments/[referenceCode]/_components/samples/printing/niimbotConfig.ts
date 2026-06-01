// the printer i am testing with is niimbot b1 (appx. 8px/mm)
// has 203 dpi with 50 x 30 mm label single
// if label comes up rotated/clipped, flip the print directtion constant
// and/or swap w/h

export const LABEL_WIDTH_PX = 400; // 50 mm
export const LABEL_HEIGHT_PX = 240; // 30 mm

export const PRINT_DIRECTION: "left" | "top" = "left";

export const DEFAULT_QUANTITY = 1;
