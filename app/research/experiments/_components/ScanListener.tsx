"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BsQrCodeScan } from "react-icons/bs";
import ScanListener from "@/components/Scan/ScanListener";
import { scanActions } from "@/actions/scan";

type Status = "idle" | "resolving" | "notFound";

// Visible scan affordance on the experiments list. A scanned sample QR opens its
// experiment with the sample selected; a lot/legacy QR routes to inventory audit.
const ExperimentsScanListener = () => {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");

  const handleScanComplete = async (raw: string) => {
    setStatus("resolving");
    const route = await scanActions.resolveRoute(raw);
    if (route) {
      router.push(route);
      setStatus("idle");
    } else {
      setStatus("notFound");
    }
  };

  return (
    <ScanListener onScanComplete={handleScanComplete}>
      <div className="my-4 flex items-center gap-x-3 rounded-xl bg-base-100 px-4 py-3 text-base-content/80">
        <BsQrCodeScan className="text-3xl" />
        <span className="font-poppins font-medium">
          {status === "resolving"
            ? "Resolving scan…"
            : status === "notFound"
              ? "Code not recognized — scan again"
              : "Scan a sample label to jump to its experiment"}
        </span>
      </div>
    </ScanListener>
  );
};

export default ExperimentsScanListener;
