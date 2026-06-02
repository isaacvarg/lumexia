import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DateTime } from "luxon";
import type { IconType } from "react-icons";
import { LuBook } from "react-icons/lu";
import { AiOutlineExperiment } from "react-icons/ai";
import { generateQR } from "@/actions/qr/generateQR";
import { LABEL_WIDTH_PX, LABEL_HEIGHT_PX } from "./niimbotConfig";

export type SampleLabelData = {
  experimentReferenceCode: number;
  sampleReferenceCode: number;
  primarySubject: string;
  variantLabel: string;
  sampleLabel: string;
  preparedAt: Date | string | null;
  qrContent: string;
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Render a react-icons component to a black SVG image we can draw on the canvas.
const loadIconImage = (Icon: IconType, sizePx: number): Promise<HTMLImageElement> => {
  const svg = renderToStaticMarkup(
    createElement(Icon, { color: "#000000", size: sizePx }),
  );
  return loadImage(`data:image/svg+xml;base64,${btoa(svg)}`);
};

// renders the sample label onto an offscreen canvas at the printer's pixel size.
export const renderSampleLabelCanvas = async (
  data: SampleLabelData,
): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement("canvas");
  canvas.width = LABEL_WIDTH_PX;
  canvas.height = LABEL_HEIGHT_PX;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D canvas context");

  // White background, black ink.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "alphabetic";

  // QR on the right.
  const qrSize = 120;
  const qrX = canvas.width - qrSize - 12;
  const qrY = (canvas.height - qrSize) / 2;
  const qrDataUrl = await generateQR(data.qrContent);
  const qrImg = await loadImage(qrDataUrl);
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  const leftX = 16;
  const textMaxWidth = qrX - leftX - 10;

  const ellipsize = (text: string, font: string) => {
    ctx.font = font;
    if (ctx.measureText(text).width <= textMaxWidth) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(`${t}…`).width > textMaxWidth) {
      t = t.slice(0, -1);
    }
    return `${t}…`;
  };

  // Top line: [notebook] experiment # [experiment flask] sample #  (icons + numbers).
  const iconSize = 32;
  const iconTop = 12;
  const topBaseline = 42;
  ctx.font = "bold 34px Arial, sans-serif";

  const [notebookImg, experimentImg] = await Promise.all([
    loadIconImage(LuBook, iconSize),
    loadIconImage(AiOutlineExperiment, iconSize),
  ]);

  let topX = leftX;
  ctx.drawImage(notebookImg, topX, iconTop, iconSize, iconSize);
  topX += iconSize + 8;
  const expCode = String(data.experimentReferenceCode);
  ctx.fillText(expCode, topX, topBaseline);
  topX += ctx.measureText(expCode).width + 22;

  ctx.drawImage(experimentImg, topX, iconTop, iconSize, iconSize);
  topX += iconSize + 8;
  ctx.fillText(String(data.sampleReferenceCode), topX, topBaseline);

  // Primary subject (clipped so it never crosses the QR).
  ctx.font = "26px Arial, sans-serif";
  ctx.fillText(ellipsize(data.primarySubject, "26px Arial, sans-serif"), leftX, 84);

  // Variant name.
  ctx.font = "bold 24px Arial, sans-serif";
  ctx.fillText(ellipsize(data.variantLabel, "bold 24px Arial, sans-serif"), leftX, 122);

  // Sample label.
  ctx.font = "22px Arial, sans-serif";
  ctx.fillText(ellipsize(data.sampleLabel, "22px Arial, sans-serif"), leftX, 158);

  // Prepared date (very bottom).
  const prepared = data.preparedAt
    ? `Prepared ${DateTime.fromJSDate(new Date(data.preparedAt)).toFormat("DD")}`
    : "Not prepared";
  ctx.font = "20px Arial, sans-serif";
  ctx.fillText(ellipsize(prepared, "20px Arial, sans-serif"), leftX, 224);

  return canvas;
};
