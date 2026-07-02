"use client";

import { useEffect, useState } from "react";
import { useItemSelection } from "@/store/itemSlice";
import { researchActions } from "@/actions/research";
import { ExperimentBySubject } from "@/actions/research/getExperimentsBySubject";
import ExperimentCard from "@/app/research/experiments/_components/shared/ExperimentCard";
import NewExperimentForSubjectButton from "@/app/research/experiments/_components/shared/NewExperimentForSubjectButton";
import SectionTitle from "@/components/Text/SectionTitle";

const Rnd = () => {
  const { item } = useItemSelection();
  const [experiments, setExperiments] = useState<ExperimentBySubject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!item) return;
    let active = true;
    setLoading(true);
    researchActions.experiments
      .getBySubject(item.id)
      .then((data) => {
        if (active) setExperiments(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [item]);

  if (!item) return null;

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle>Experiments</SectionTitle>
        <NewExperimentForSubjectButton subjectItemId={item.id} />
      </div>

      {loading ? (
        <div className="skeleton h-24 w-full" />
      ) : experiments.length === 0 ? (
        <div className="text-base-content/60 py-8 text-center">
          No experiments have this item as their subject yet.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {experiments.map((experiment) => (
            <ExperimentCard key={experiment.id} experiment={experiment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Rnd;
