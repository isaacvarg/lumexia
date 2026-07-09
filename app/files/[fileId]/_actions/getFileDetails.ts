'use server'
import prisma from "@/lib/prisma"
import { getSlug } from "@/utils/general/getSlug"
import { FileModule } from "../../_actions/getAllFiles"
import { getFileUrl } from "@/actions/files/getUrl"

export type FileTypeOption = {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
};

export type FileTagItem = {
  id: string;
  tag: { id: string; name: string; bgColor: string; textColor: string };
};

export type FileDetails = {
  file: {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    public: boolean;
    createdAt: Date;
    updatedAt: Date;
    uploadedBy: { name: string | null; image: string | null };
  };
  url: string;
  thumbnailUrl: string | null;
  module: FileModule;
  junctionId: string | null;
  fileType: FileTypeOption | null;
  ownerLink: { href: string; label: string } | null;
  availableFileTypes: FileTypeOption[];
  tags: FileTagItem[];
};

export const getFileDetails = async (fileId: string): Promise<FileDetails | null> => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      uploadedBy: true,
      fileTags: {
        include: { tag: true },
        orderBy: { createdAt: "asc" },
      },
      itemFiles: { include: { fileType: true }, take: 1 },
      poAccountingFiles: {
        include: { fileType: true, purchaseOrder: true },
        take: 1,
      },
      qcRecordFiles: {
        include: { fileType: true, qcRecord: true },
        take: 1,
      },
      bprStagingFiles: {
        include: {
          staging: {
            include: {
              bprBom: {
                include: { bpr: true },
              },
            },
          },
        },
        take: 1,
      },
      generalRequestFiles: { take: 1 },
      // Note file presence checks
      itemNoteFiles: { take: 1, select: { id: true } },
      requestNoteFiles: { take: 1, select: { id: true } },
      generalRequestNoteFiles: { take: 1, select: { id: true } },
      purchaseOrderNoteFiles: { take: 1, select: { id: true } },
      poPublicNoteFiles: { take: 1, select: { id: true } },
      poSupplierNoteFiles: { take: 1, select: { id: true } },
      poAccountingNoteFiles: { take: 1, select: { id: true } },
      pricingExaminationNoteFiles: { take: 1, select: { id: true } },
      auditRequestNoteFiles: { take: 1, select: { id: true } },
      discrepancyAuditItemNoteFiles: { take: 1, select: { id: true } },
      lotNoteFiles: { take: 1, select: { id: true } },
      bprNoteFiles: { take: 1, select: { id: true } },
      qcRecordNoteFiles: { take: 1, select: { id: true } },
      mbprNoteFiles: { take: 1, select: { id: true } },
    },
  });

  if (!file) return null;

  const url = await getFileUrl(file.bucketName, file.objectName);
  const thumbnailUrl =
    file.thumbnailBucketName && file.thumbnailObjectName
      ? await getFileUrl(file.thumbnailBucketName, file.thumbnailObjectName)
      : null;

  let fileModule: FileModule = "unassigned";
  let junctionId: string | null = null;
  let fileType: FileTypeOption | null = null;
  let ownerLink: { href: string; label: string } | null = null;
  let availableFileTypes: FileTypeOption[] = [];

  if (file.itemFiles.length > 0) {
    const junc = file.itemFiles[0];
    fileModule = "item";
    junctionId = junc.id;
    fileType = { id: junc.fileType.id, name: junc.fileType.name, bgColor: junc.fileType.bgColor, textColor: junc.fileType.textColor };

    const item = await prisma.item.findUnique({ where: { id: junc.itemId }, select: { id: true, name: true } });
    if (item) {
      ownerLink = { href: `/inventory/items/${getSlug(item.name)}?id=${item.id}`, label: item.name };
    }

    availableFileTypes = await prisma.itemFileType.findMany({
      select: { id: true, name: true, bgColor: true, textColor: true },
    });

  } else if (file.poAccountingFiles.length > 0) {
    const junc = file.poAccountingFiles[0];
    fileModule = "po-accounting";
    junctionId = junc.id;
    fileType = { id: junc.fileType.id, name: junc.fileType.name, bgColor: junc.fileType.bgColor, textColor: junc.fileType.textColor };
    ownerLink = {
      href: `/accounting/pos/${junc.purchaseOrder.referenceCode}?id=${junc.purchaseOrder.id}`,
      label: String(junc.purchaseOrder.referenceCode),
    };

    availableFileTypes = await prisma.poAccountingFileType.findMany({
      select: { id: true, name: true, bgColor: true, textColor: true },
    });

  } else if (file.qcRecordFiles.length > 0) {
    const junc = file.qcRecordFiles[0];
    fileModule = "qc-record";
    junctionId = junc.id;
    fileType = { id: junc.fileType.id, name: junc.fileType.name, bgColor: junc.fileType.bgColor, textColor: junc.fileType.textColor };
    // No dedicated QC record detail page
    ownerLink = null;

    availableFileTypes = await prisma.qcRecordFileType.findMany({
      select: { id: true, name: true, bgColor: true, textColor: true },
    });

  } else if (file.bprStagingFiles.length > 0) {
    const junc = file.bprStagingFiles[0];
    fileModule = "bpr-staging";
    junctionId = junc.id;
    const bpr = junc.staging.bprBom.bpr;
    ownerLink = {
      href: `/production/bpr/${String(bpr.referenceCode)}?id=${bpr.id}`,
      label: `BPR ${String(bpr.referenceCode)}`,
    };

  } else if (file.generalRequestFiles.length > 0) {
    const junc = file.generalRequestFiles[0];
    fileModule = "general-request";
    junctionId = junc.id;
    ownerLink = {
      href: `/purchasing/requests/general/${junc.generalRequestId}?id=${junc.generalRequestId}`,
      label: "General Request",
    };

  } else if (
    file.itemNoteFiles.length > 0 ||
    file.requestNoteFiles.length > 0 ||
    file.generalRequestNoteFiles.length > 0 ||
    file.purchaseOrderNoteFiles.length > 0 ||
    file.poPublicNoteFiles.length > 0 ||
    file.poSupplierNoteFiles.length > 0 ||
    file.poAccountingNoteFiles.length > 0 ||
    file.pricingExaminationNoteFiles.length > 0 ||
    file.auditRequestNoteFiles.length > 0 ||
    file.discrepancyAuditItemNoteFiles.length > 0 ||
    file.lotNoteFiles.length > 0 ||
    file.bprNoteFiles.length > 0 ||
    file.qcRecordNoteFiles.length > 0 ||
    file.mbprNoteFiles.length > 0
  ) {
    fileModule = "note";
  }

  const tags: FileTagItem[] = file.fileTags.map((ft) => ({
    id: ft.id,
    tag: {
      id: ft.tag.id,
      name: ft.tag.name,
      bgColor: ft.tag.bgColor,
      textColor: ft.tag.textColor,
    },
  }));

  return {
    file: {
      id: file.id,
      name: file.name,
      size: file.size,
      mimeType: file.mimeType,
      public: file.public,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      uploadedBy: { name: file.uploadedBy.name, image: file.uploadedBy.image },
    },
    url,
    thumbnailUrl,
    module: fileModule,
    junctionId,
    fileType,
    ownerLink,
    availableFileTypes,
    tags,
  };
};
