"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TbFlask } from "react-icons/tb";
import { researchActions } from "@/actions/research";
import useToast from "@/hooks/useToast";

type Props = {
  subjectItemId: string;
  label?: string;
  className?: string;
};

/**
 * Creates a new experiment with the given item preselected as the subject, then
 * navigates to the new experiment. Used from item details and MBPR R&D tabs.
 */
const NewExperimentForSubjectButton = ({
  subjectItemId,
  label = "New experiment",
  className = "btn btn-primary",
}: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const experiment = await researchActions.experiments.create({
        primarySubjectId: subjectItemId,
      });
      router.push(
        `/research/experiments/${experiment.referenceCode}?id=${experiment.id}`,
      );
    } catch {
      toast("Could not create", "Failed to create the experiment.", "error");
      setLoading(false);
    }
  };

  return (
    <button className={className} onClick={handleClick} disabled={loading}>
      {loading ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <TbFlask />
      )}
      {label}
    </button>
  );
};

export default NewExperimentForSubjectButton;
