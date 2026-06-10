import { IMicroFormInputs } from "@/app/quality/micro/new/_components/SampleDesignation";
import { IBprForSSF } from "@/app/quality/micro/new/_functions/getBprs";
import { getSampleGroups } from "./functions/getSampleGroups";
import { createMicroSubmissionPDF } from "./functions/createMicroSubmissionPDF";
import jsPDF from "jspdf";
import microSubmissionActions from "@/actions/quality/microSubmissionActions";
import { Config } from "@prisma/client";
import { createConfigLookup } from "@/utils/data/createConfigLookup";
import { getCompanyPdfImages } from "@/actions/app/images/getCompanyPdfImages";

export interface MicroFormResponses {
  submittedBy: string;
  sendResultsTo: {
    name: string;
    telephone: string;
    email: string;
  };
  testRequested: string[];
  servingSize: string;
  includeSignature: boolean;
}

export const generateMicroSubmissionForm = async (bpr: IBprForSSF, samples: IMicroFormInputs, microFormData: Config[]) => {
    const groupedSamples = getSampleGroups(samples);
    const { microFormTemplate, signature } = await getCompanyPdfImages();
    const microFormResponsesLookup = createConfigLookup(microFormData);

    const microFormResponses = {
        submittedBy: microFormResponsesLookup['submittedBy'],
        sendResultsTo: {
            name: microFormResponsesLookup['submittedBy'],
            telephone: microFormResponsesLookup['submittedBy'],
            email: microFormResponsesLookup['submittedBy'],
        },
        testRequested: ['Total Plate Count (TPC)', 'Yeast and Mold'],
        servingSize: '~ 60 g',
        includeSignature: true,
    }

    let pdf = new jsPDF({
        orientation: "l",
        format: [459, 354.6818],
        unit: "px",
    });

    // Create an array of promises
    const promises = groupedSamples.map(async (group, index) => {
        const submission = await microSubmissionActions.createNew({
            bprId: bpr.bprId,
        });
        const submissionNumber = await submission.submissionNumber;

        await createMicroSubmissionPDF(group, index, bpr, submissionNumber, pdf, microFormResponses, microFormTemplate, signature);
    });

    // Use Promise.all to wait for all promises to resolve
    await Promise.all(promises);

    pdf.save(`SSF.pdf`);
}
