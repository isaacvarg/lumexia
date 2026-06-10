"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BsQrCodeScan } from "react-icons/bs";
import Panel from "../Panel";
import ScanListener from "@/components/Scan/ScanListener";
import { scanActions } from "@/actions/scan";

type Status = "idle" | "resolving" | "notFound";

const UniversalScanner = () => {
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
    <Panel title="Universal Scanner">
      <ScanListener onScanComplete={handleScanComplete}>
        <div className="p-8 rounded-lg bg-base-200/50 flex flex-col items-center justify-center gap-y-4">
          <BsQrCodeScan className="text-[100px]" />
          <h1 className="font-poppins text-2xl font-bold text-base-content">
            {status === "resolving"
              ? "Resolving…"
              : status === "notFound"
                ? "Code not recognized — try again"
                : "Scan any code"}
          </h1>
          <p className="font-poppins text-sm text-base-content/60 text-center">
            Sample, lot, or legacy label — routes to the right place automatically.
          </p>
        </div>
      </ScanListener>
    </Panel>
  );
};

export default UniversalScanner;
