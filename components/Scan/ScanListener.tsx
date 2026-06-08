"use client";
import { useCallback, useEffect, useState } from "react";
import { BsQrCodeScan } from "react-icons/bs";

interface ScanListenerProps {
  onScanComplete: (scannedData: string) => void;
  children?: React.ReactNode;
}

const ScanListener: React.FC<ScanListenerProps> = ({
  onScanComplete,
  children,
}) => {
  const [scannedData, setScannedData] = useState("");

  const handleScan = useCallback(
    (event: KeyboardEvent) => {
      // Ignore keystrokes that can't be from a hardware scanner: modifier-key
      // chords (e.g. Ctrl+K) and anything typed into a focused editable element
      // (the command palette, search inputs, etc.). Otherwise the global listener
      // hijacks the user's typing and submits it as a "scan" on Enter.
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "Enter") {
        if (scannedData.trim() !== "") {
          onScanComplete(scannedData);
        }
        setScannedData(""); // Reset for the next scan
        return;
      }

      if (event.key.length === 1) {
        setScannedData((prev) => prev + event.key);
      }
    },
    [scannedData, onScanComplete],
  );

  useEffect(() => {
    // Use keydown (not keypress): keydown still fires for the scanner's terminating
    // Enter even when another handler calls preventDefault() on it (e.g. an always-on
    // useHotkeys('enter', { preventDefault: true })), which would otherwise suppress the
    // follow-up keypress and silently break scanning on that page.
    window.addEventListener("keydown", handleScan);

    return () => {
      window.removeEventListener("keydown", handleScan);
    };
  }, [handleScan]);

  const defaultContent = (
    <div className="p-8 rounded-lg bg-base-200/50 flex flex-col items-center justify-center gap-y-4">
      <BsQrCodeScan className="text-[100px]" />
      <h1 className="font-poppins text-4xl font-bold text-base-content">Scan Barcode</h1>
    </div>
  );

  return <>{children || defaultContent}</>;
};

export default ScanListener;
