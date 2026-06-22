import { jsPDF } from "jspdf";
import { DateTime } from "luxon";

// assets & data
import "../../../assets/fonts/Lato-Black-normal";
import "../../../assets/fonts/Lato-Regular-normal";
import "../../../assets/fonts/Lato-Bold-normal";
import { IBprForSSF } from "@/app/quality/micro/new/_functions/getBprs";
import { MicroFormResponses } from "../generateMicroSubmissionForm";

export const createMicroSubmissionPDF = async (group: string[], index: number, bpr: IBprForSSF, submissionNumber: number, pdf: jsPDF, microFormResponses: MicroFormResponses, microFormTemplate: string | null, signature: string | null) => {

    const currentDate = DateTime.now().toFormat("dd MMM yyyy");
    const { submittedBy, sendResultsTo, servingSize, testRequested, includeSignature } = microFormResponses
    const reasonForSubmission = `QC, ${bpr.producedItemName}`
    const {
        producedItemIID,
        lotNumber,
    } = bpr;
    const LotNumberShortened = lotNumber.split(".")[1];

    if (index !== 0) {
        pdf.addPage()
    }

    if (microFormTemplate) {
        pdf.addImage(microFormTemplate, "PNG", 0, 0, 459, 354.6818);
    }

    pdf
        .setFontSize(10)
        .setTextColor("#333333");


    pdf.text(currentDate, 125, 90);
    pdf.text(submittedBy, 130, 105);

    pdf.text(sendResultsTo.name, 105, 123);
    pdf.text(sendResultsTo.telephone, 115, 137);
    pdf.text(sendResultsTo.email, 105, 150);

    pdf.text(reasonForSubmission, 239, 121);
    pdf.text(submissionNumber.toString(), 386, 154);
    pdf.setLineWidth(2);
    pdf.line(235, 152, 241, 145)

    pdf.text(submittedBy, 115, 304);

    if (includeSignature && signature) {
        pdf.addImage(signature, "PNG", 285, 275, 56.625, 35.325);
    }

    pdf
        .setFontSize(10)
        .setTextColor("#000000");
    pdf.text(group, 20, 210, { lineHeightFactor: 2 })
    pdf.text(Array.from({ length: group.length }, (v, k) => 'Main'), 130, 210, { lineHeightFactor: 2 })

    pdf
        .setFontSize(8)
    let lh2 = 2.5; //line height factor
    pdf.text(Array.from({ length: group.length }, (v, k) => producedItemIID), 173, 210, { lineHeightFactor: lh2 });
    pdf.text(Array.from({ length: group.length }, (v, k) => LotNumberShortened), 211, 210, { lineHeightFactor: lh2 });
    pdf.text(Array.from({ length: group.length }, (v, k) => servingSize), 406, 210, { lineHeightFactor: lh2 })

    pdf
        .setFontSize(7)
    let lh3 = 3; //line height factor
    pdf.text(Array.from({ length: group.length }, (v, k) => testRequested[0]), 258, 203, { lineHeightFactor: lh3 });
    pdf.text(Array.from({ length: group.length }, (v, k) => testRequested[1]), 258, 208, { lineHeightFactor: lh3 });

}
