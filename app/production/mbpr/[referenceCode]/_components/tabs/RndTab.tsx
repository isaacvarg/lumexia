"use client";

import { useEffect, useState } from "react";
import { useMbprDetailsSelection } from "@/store/mbprDetailsSlice";
import { researchActions } from "@/actions/research";
import { ExperimentByMbpr } from "@/actions/research/getExperimentsByMbpr";
import ExperimentCard from "@/app/research/experiments/_components/shared/ExperimentCard";
import NewExperimentForSubjectButton from "@/app/research/experiments/_components/shared/NewExperimentForSubjectButton";
import SectionTitle from "@/components/Text/SectionTitle";

const RndTab = () => {
  const { mbpr } = useMbprDetailsSelection();
  const [experiments, setExperiments] = useState<ExperimentByMbpr[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mbpr) return;
    let active = true;
    setLoading(true);
    researchActions.experiments
      .getByMbpr(mbpr.id)
      .then((data) => {
        if (active) setExperiments(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [mbpr]);

  if (!mbpr) return null;

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <SectionTitle>R&D</SectionTitle>
          <p className="text-sm text-base-content/60">
            Experiments with a variant made from this MBPR version.
          </p>
        </div>
        <NewExperimentForSubjectButton subjectItemId={mbpr.producesItemId} />
      </div>

      {loading ? (
        <div className="skeleton h-24 w-full" />
      ) : experiments.length === 0 ? (
        <div className="text-base-content/60 py-8 text-center">
          No experiments use this MBPR version as a variant yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiments.map((experiment) => (
            <ExperimentCard
              key={experiment.id}
              experiment={experiment}
              footer={
                <div className="flex flex-wrap gap-1">
                  {experiment.variants.map((variant) => (
                    <span
                      key={variant.id}
                      className="badge badge-sm badge-outline"
                    >
                      {variant.label}
                    </span>
                  ))}
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RndTab;
