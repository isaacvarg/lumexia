import { DateTime } from "luxon";
import { generateQR } from "@/actions/qr/generateQR";
import { LABEL_WIDTH_PX, LABEL_HEIGHT_PX } from "./niimbotConfig";

export type SampleLabelData = {
  referenceCode: number;
  sampleLabel: string;
  variantLabel: string;
  preparedAt: Date | string | null;
  qrContent: string;
};

const formatSampleRef = (code: number) => `S-${String(code).padStart(2, "0")}`;

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

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

  // Reference code (large).
  ctx.font = "bold 44px Arial, sans-serif";
  ctx.fillText(formatSampleRef(data.referenceCode), leftX, 56);

  // Sample label.
  ctx.font = "28px Arial, sans-serif";
  ctx.fillText(ellipsize(data.sampleLabel, "28px Arial, sans-serif"), leftX, 100);

  // Variant label.
  ctx.font = "bold 24px Arial, sans-serif";
  ctx.fillText(
    ellipsize(data.variantLabel, "bold 24px Arial, sans-serif"),
    leftX,
    140,
  );

  // Prepared date.
  const prepared = data.preparedAt
    ? `Prepared ${DateTime.fromJSDate(new Date(data.preparedAt)).toFormat("DD")}`
    : "Not prepared";
  ctx.font = "20px Arial, sans-serif";
  ctx.fillText(ellipsize(prepared, "20px Arial, sans-serif"), leftX, 180);

  return canvas;
};
