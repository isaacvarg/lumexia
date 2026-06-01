"use client";
import { useState } from "react";
import { TbRobot } from "react-icons/tb";
import useToast from "@/hooks/useToast";

type Props = {
  /** Returns the text to copy. May be async (e.g. a server action call). */
  getText: () => string | Promise<string>;
  /** Hover/aria label describing what gets copied. */
  tooltip?: string;
  className?: string;
};

const CopyForLlmButton = ({
  getText,
  tooltip = "Copy context for an LLM",
  className = "btn btn-ghost btn-sm",
}: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const text = await getText();
      await navigator.clipboard.writeText(text);
      toast("Copied", "LLM context copied to clipboard.", "success");
    } catch {
      toast("Copy failed", "Could not copy LLM context.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`${className} tooltip`}
      data-tip={tooltip}
      aria-label={tooltip}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <TbRobot />
      )}
    </button>
  );
};

export default CopyForLlmButton;
