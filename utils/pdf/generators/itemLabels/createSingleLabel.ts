import { jsPDF } from "jspdf";
import { DateTime } from "luxon";

// assets & data
import "../../assets/fonts/Lato-Black-normal";
import "../../assets/fonts/Lato-Regular-normal";
import "../../assets/fonts/Lato-Bold-normal";
import { LabelData } from "./createLabelsPDF";



export const createSingleLabel = async (pdf: jsPDF, lot: LabelData) => {
  const timestamp = DateTime.now().toFormat("DD @t");

  pdf.setFontSize(25);
  pdf.text(lot.lot.lotNumber, 2, 0.5, { align: "center" });
  pdf.setFontSize(15);
  pdf.text(lot.lot.item.name, 2, 1, { align: "center" });
  pdf.addImage(lot.qr, "PNG", 1.35, 1.25, 1.25, 1.25);
  if (lot.lot.supplierLotNumber) {
    pdf.setFontSize(9);
    pdf.text(`Supplier lot ${lot.lot.supplierLotNumber}`, 2, 2.68, { align: "center" });
  }
  pdf.setFontSize(5);
  pdf.text(timestamp, 2, 2.85, { align: "center" });
};
