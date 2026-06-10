import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DateTime } from "luxon";

import { getImageDimensions } from "../functions/getImageDimensions";
import "../assets/fonts/Lato-Black-normal";
import "../assets/fonts/Lato-Regular-normal";
import "../assets/fonts/Lato-Bold-normal";
import { getCompanyPdfImages } from "@/actions/app/images/getCompanyPdfImages";
import { getAutoTableEnd } from "../functions/getAutoTableEnd";
import { createConfigLookup } from "@/utils/data/createConfigLookup";
import { Config } from "@prisma/client";
import { QcItemParameter } from "@/actions/quality/qc/parameters/getAllByItemAndQcRecord";
import { formatSpecification } from "@/utils/qc/formatSpecification";
import { findMatchingSpec } from "@/utils/qc/evaluateSpecification";

const formatSpecConditions = (
  spec: QcItemParameter["specifications"][number],
  inputDefinitions: { id: string; name: string; unit: string }[],
): string => {
  if (spec.itemSpecificationInputs.length === 0) return "";
  return spec.itemSpecificationInputs
    .map((si) => {
      const def = inputDefinitions.find((d) => d.id === si.parameterInputDefinitionId);
      const label = def?.name ?? "";
      const unit = def?.unit ? ` ${def.unit}` : "";
      return `${label} ${si.value}${unit}`.trim();
    })
    .join(", ");
};

export const createCertificateOfAnalysis = async (
  itemName: string,
  referenceCode: string | null,
  lotNumber: string,
  examinationDate: Date,
  parameters: QcItemParameter[],
  statusName: string,
  companyData: Config[],
  examinationTypeId: string,
): Promise<jsPDF> => {
  const { logo } = await getCompanyPdfImages();
  const logoDimensions = logo ? await getImageDimensions(logo) : null;
  const companyLookup = createConfigLookup(companyData);

  const company = {
    name: companyLookup["name"] ?? "",
    address: {
      street1: companyLookup["addressStreet1"] ?? "",
      street2: companyLookup["addressStreet2"] ?? "",
      city: companyLookup["addressCity"] ?? "",
      state: companyLookup["addressState"] ?? "",
      zipcode: companyLookup["addressZipcode"] ?? "",
    },
    phone: companyLookup["phone"] ?? "",
    email: companyLookup["email"] ?? "",
  };

  const examDt = DateTime.fromJSDate(examinationDate);
  const manufactureDate = examDt.toFormat("DD");
  const analysisDate = examDt.toFormat("DD");
  const bestByDate = examDt.plus({ years: 2 }).toFormat("DD");

  const pdf = new jsPDF({
    orientation: "p",
    format: "letter",
    unit: "px",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const logoResizeFactor = 0.3;
  const logoW = logoDimensions ? logoDimensions.width * logoResizeFactor : 0;
  const logoH = logoDimensions ? logoDimensions.height * logoResizeFactor : 0;

  // Centered logo
  if (logo && logoDimensions) {
    pdf.addImage(logo, (pageWidth - logoW) / 2, 20, logoW, logoH);
  }

  const afterLogo = 20 + logoH + 12;

  // Title
  pdf
    .setFontSize(20)
    .setFont("Lato-Black", "normal", "normal")
    .setTextColor("#333333");
  pdf.text("Certificate of Analysis", pageWidth / 2, afterLogo, { align: "center" });

  // Horizontal rule
  const ruleY = afterLogo + 8;
  pdf.setDrawColor("#CCCCCC").setLineWidth(0.5).line(30, ruleY, pageWidth - 30, ruleY);

  // Two-column info section
  const infoY = ruleY + 18;
  const leftX = 30;
  const rightX = 260;
  const labelColor = "#666666";
  const valueColor = "#333333";
  const lineH = 14;

  const leftLabels = ["Product", "SKU", "Batch #"];
  const leftValues = [itemName, referenceCode ?? "N/A", lotNumber];
  const rightLabels = ["Manufacture Date", "Analysis Date", "Best By Date"];
  const rightValues = [manufactureDate, analysisDate, bestByDate];

  leftLabels.forEach((label, i) => {
    pdf.setFontSize(9).setFont("Lato-Bold", "normal", "normal").setTextColor(labelColor);
    pdf.text(label, leftX, infoY + i * lineH);
    pdf.setFont("Lato-Regular", "normal", "normal").setTextColor(valueColor);
    pdf.text(leftValues[i], leftX + 60, infoY + i * lineH);
  });

  rightLabels.forEach((label, i) => {
    pdf.setFontSize(9).setFont("Lato-Bold", "normal", "normal").setTextColor(labelColor);
    pdf.text(label, rightX, infoY + i * lineH);
    pdf.setFont("Lato-Regular", "normal", "normal").setTextColor(valueColor);
    pdf.text(rightValues[i], rightX + 85, infoY + i * lineH);
  });

  // Results section header
  const resultsHeaderY = infoY + leftLabels.length * lineH + 16;
  pdf
    .setFontSize(12)
    .setFont("Lato-Bold", "normal", "normal")
    .setTextColor("#333333");
  pdf.text("Results", leftX, resultsHeaderY);

  // Results table — one row per displayable spec (or one fallback row if none).
  const tableRows = parameters.flatMap((param) => {
    const uom = param.parameter.uom && param.parameter.uom !== "" ? param.parameter.uom : "Not Applicable";
    const visibleSpecs = param.specifications.filter(
      (s) => s.displayOnCoa && s.examinationTypeId === examinationTypeId,
    );

    if (visibleSpecs.length === 0) {
      const fallbackResult = param.results[0];
      return [[
        param.parameter.name,
        "Not Specified",
        fallbackResult?.value ?? "N/A",
        uom,
        statusName,
      ]];
    }

    return visibleSpecs.map((spec) => {
      const matchingRun = param.results.find((run) => {
        const match = findMatchingSpec(visibleSpecs, run);
        return match?.id === spec.id;
      });
      const conditions = formatSpecConditions(spec, param.parameter.inputDefinitions);
      const label = spec.name
        ? `${param.parameter.name} (${spec.name})`
        : conditions
          ? `${param.parameter.name} (${conditions})`
          : param.parameter.name;
      return [
        label,
        formatSpecification(spec),
        matchingRun?.value ?? "—",
        uom,
        statusName,
      ];
    });
  });

  autoTable(pdf, {
    startY: resultsHeaderY + 8,
    headStyles: { fillColor: "#333333", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    head: [["Analytical Property", "Specification", "Result", "UOM", "Status"]],
    body: tableRows,
    columnStyles: {
      0: { cellWidth: 110 },
      1: { cellWidth: 80 },
      2: { cellWidth: 60 },
      3: { cellWidth: 60 },
      4: { cellWidth: 65 },
    },
  });

  const tableEnd = getAutoTableEnd(pdf);

  // Batch Approval section
  const approvalY = tableEnd + 24;
  pdf
    .setFontSize(12)
    .setFont("Lato-Bold", "normal", "normal")
    .setTextColor("#333333");
  pdf.text("Batch Approval", leftX, approvalY);

  pdf
    .setFontSize(9)
    .setFont("Lato-Bold", "normal", "normal")
    .setTextColor(labelColor);
  pdf.text("Status", leftX, approvalY + 14);
  pdf.setFont("Lato-Regular", "normal", "normal").setTextColor(valueColor);
  pdf.text(statusName, leftX + 40, approvalY + 14);

  pdf.setFontSize(8).setFont("Lato-Regular", "normal", "normal").setTextColor("#555555");
  const disclaimer = "This document was electronically generated and approved. No physical signature is required.";
  pdf.text(disclaimer, leftX, approvalY + 28);

  // Footer
  const footerY = approvalY + 50;
  const footerText = [
    `${company.name} | ${company.address.street1}${company.address.street2 ? " " + company.address.street2 : ""}, ${company.address.city}, ${company.address.state} ${company.address.zipcode}`,
    `${company.phone} | ${company.email}`,
  ];

  pdf.setDrawColor("#E3E3E3").setLineWidth(0.5).line(30, footerY, pageWidth - 30, footerY);
  pdf.setFontSize(8).setFont("Lato-Regular", "normal", "normal").setTextColor("#555555");
  footerText.forEach((line, i) => {
    pdf.text(line, pageWidth / 2, footerY + 10 + i * 10, { align: "center" });
  });
  pdf.line(30, footerY + 26, pageWidth - 30, footerY + 26);

  return pdf;
};
