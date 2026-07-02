"use client";

import { useRouter } from "next/navigation";
import { DateTime } from "luxon";

const formatReferenceCode = (code: number) => `EXP-${String(code).padStart(4, "0")}`;

type ExperimentCardStatus = {
  name: string;
  bgColor: string;
  textColor: string;
};

export type ExperimentCardData = {
  id: string;
  referenceCode: number;
  objective: string | null;
  createdAt: Date;
  status: ExperimentCardStatus | null;
  primarySubject: { name: string } | null;
};

type Props = {
  experiment: ExperimentCardData;
  /** Optional extra line rendered under the objective (e.g. matching variant labels). */
  footer?: React.ReactNode;
};

const ExperimentCard = ({ experiment, footer }: Props) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(
      `/research/experiments/${experiment.referenceCode}?id=${experiment.id}`,
    );
  };

  return (
    <div
      onClick={handleClick}
      className="card bg-base-300/50 border-base-300/50 border-2 hover:cursor-pointer hover:bg-base-300/30"
    >
      <div className="card-body flex flex-col gap-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center justify-center px-2 py-1 bg-primary rounded-xl">
            <p className="font-poppins text-center font-semibold text-sm text-primary-content">
              {formatReferenceCode(experiment.referenceCode)}
            </p>
          </div>
          {experiment.status && (
            <span
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: experiment.status.bgColor,
                color: experiment.status.textColor,
              }}
            >
              {experiment.status.name}
            </span>
          )}
        </div>

        <div className="card-title text-base">
          {experiment.primarySubject?.name ?? "—"}
        </div>

        {experiment.objective && (
          <p className="text-sm text-base-content/70">
            {experiment.objective.length > 120
              ? `${experiment.objective.slice(0, 120)}…`
              : experiment.objective}
          </p>
        )}

        {footer}

        <div className="text-xs text-base-content/50">
          {DateTime.fromJSDate(new Date(experiment.createdAt)).toRelative()}
        </div>
      </div>
    </div>
  );
};

export default ExperimentCard;
