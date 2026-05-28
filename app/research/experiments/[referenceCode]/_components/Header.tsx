import Link from "next/link";
import { SingleExperiment } from "@/actions/research/getOneExperiment";
import { getSlug } from "@/utils/general/getSlug";

const formatReferenceCode = (code: number) => `EXP-${String(code).padStart(4, "0")}`;

const Header = ({ experiment }: { experiment: SingleExperiment }) => {
  const subject = experiment.primarySubject;
  const subjectHref = `/inventory/items/${getSlug(subject.name)}?id=${subject.id}`;

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex flex-col gap-y-1">
        <h1 className="font-poppins text-3xl font-semibold text-base-content">
          {formatReferenceCode(experiment.referenceCode)}
        </h1>
        <div className="flex items-center gap-x-3 text-base-content/80">
          <span>Subject:</span>
          <Link className="link link-hover font-medium" href={subjectHref}>
            {subject.name}
          </Link>
          <span className="text-base-content/40">•</span>
          <span>Investigator: {experiment.primaryInvestigator.name ?? "—"}</span>
        </div>
      </div>
      <span
        className="px-3 py-1 rounded-xl font-poppins font-medium text-lg"
        style={{
          backgroundColor: experiment.status.bgColor,
          color: experiment.status.textColor,
        }}
      >
        {experiment.status.name}
      </span>
    </div>
  );
};

export default Header;
