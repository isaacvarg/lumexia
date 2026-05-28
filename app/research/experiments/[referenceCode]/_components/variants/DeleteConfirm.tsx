"use client";
import { useState, useEffect } from "react";
import { TbTrash } from "react-icons/tb";

type Props = {
  onConfirm: () => void | Promise<void>;
  label?: string;
  className?: string;
};

// Click once to arm; click again within 3s to confirm. Auto-disarms.
const DeleteConfirm = ({ onConfirm, label = "Delete", className = "" }: Props) => {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  const handleClick = async () => {
    if (!armed) {
      setArmed(true);
      return;
    }
    setArmed(false);
    await onConfirm();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn btn-sm ${armed ? "btn-error" : "btn-ghost"} ${className}`}
      aria-label={armed ? `Confirm ${label}` : label}
    >
      <TbTrash />
      {armed ? "Confirm?" : label}
    </button>
  );
};

export default DeleteConfirm;
