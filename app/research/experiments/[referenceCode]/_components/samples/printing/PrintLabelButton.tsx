"use client";
import { useState } from "react";
import { TbPrinter, TbLoader2, TbCheck, TbAlertTriangle } from "react-icons/tb";
import { ExperimentSampleRow } from "@/actions/research/samples/getAllByExperiment";
import { renderSampleLabelCanvas } from "./renderSampleLabel";
import { printCanvas, isWebBluetoothAvailable } from "./niimbotPrinter";
import { buildScanPayload, SCAN_TYPES } from "@/lib/scan/scanPayload";

type Props = {
  sample: ExperimentSampleRow;
  variantLabel: string;
  experimentReferenceCode: number;
  primarySubject: string;
};

type Status = "idle" | "working" | "done" | "error";

const PrintLabelButton = ({
  sample,
  variantLabel,
  experimentReferenceCode,
  primarySubject,
}: Props) => {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handlePrint = async () => {
    setError(null);

    if (!isWebBluetoothAvailable()) {
      setStatus("error");
      setError(
        "Web Bluetooth unavailable. Open this page on the printer's computer in Chrome/Edge and enable the insecure-origin flag for this site.",
      );
      return;
    }

    setStatus("working");
    try {
      const canvas = await renderSampleLabelCanvas({
        experimentReferenceCode,
        sampleReferenceCode: sample.referenceCode,
        primarySubject,
        variantLabel,
        sampleLabel: sample.label,
        preparedAt: sample.preparedAt,
        qrContent: buildScanPayload(SCAN_TYPES.sample, sample.id),
      });
      await printCanvas(canvas);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setStatus("error");
      // User cancelling the device chooser throws — treat as a quiet reset.
      if (err instanceof DOMException && err.name === "NotFoundError") {
        setStatus("idle");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to print label.");
    }
  };

  const icon = {
    idle: <TbPrinter />,
    working: <TbLoader2 className="animate-spin" />,
    done: <TbCheck />,
    error: <TbAlertTriangle />,
  }[status];

  return (
    <button
      type="button"
      className={`btn btn-ghost btn-sm ${status === "error" ? "text-error" : ""}`}
      onClick={handlePrint}
      disabled={status === "working"}
      aria-label="Print sample label"
      title={error ?? "Print sample label"}
    >
      {icon} Print
    </button>
  );
};

export default PrintLabelButton;
