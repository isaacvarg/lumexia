import { createCertificateOfAnalysis } from "@/utils/pdf/generators/certificateOfAnalysis";
import { getCoaData } from "./getCoaData";
import { ensureRegulatoryFileType } from "./ensureRegulatoryFileType";
import { createItemFile } from "../files/createItemFile";
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { DateTime } from "luxon";
import { FileResponseData } from "@/app/api/upload/route";
import { QcRecordExpanded } from "@/actions/quality/qc/records/getAllByItem";
import { SingleItem } from "@/actions/inventory/getOneItem";

export const generateCoa = async (
  item: SingleItem,
  lotNumber: string,
  qcRecord: QcRecordExpanded
) => {
  const { parameters, companyData } = await getCoaData(item.id, qcRecord.id);

  const pdf = await createCertificateOfAnalysis(
    item.name,
    item.referenceCode ?? null,
    lotNumber,
    qcRecord.createdAt,
    parameters,
    qcRecord.status.name,
    companyData,
    qcRecord.examinationTypeId,
  );

  const dateStr = DateTime.now().toFormat("yyyy-MM-dd");
  const safeName = item.name.replace(/[^a-zA-Z0-9-_]/g, "_");
  const safeLot = lotNumber.replace(/[^a-zA-Z0-9-_]/g, "_");
  const filename = `COA_${safeName}_Lot-${safeLot}_${dateStr}.pdf`;

  const blob = pdf.output("blob");

  // Trigger browser download
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);

  // Upload to S3
  const formData = new FormData();
  formData.append("file", new File([blob], filename, { type: "application/pdf" }));
  formData.append("pathPrefix", "/item/coa");

  const uploadRes = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload COA to storage");
  }

  const uploadData: FileResponseData = await uploadRes.json();

  // Ensure the "Regulatory" file type exists
  const fileType = await ensureRegulatoryFileType();

  // Link file to item
  await createItemFile({
    fileTypeId: fileType.id,
    fileId: uploadData.fileId,
    itemId: item.id,
  });

  // Log activity
  await createActivityLog(
    "generated",
    "COA",
    item.id,
    {
      lotNumber,
      qcRecordId: qcRecord.id,
      filename,
    }
  );
};
