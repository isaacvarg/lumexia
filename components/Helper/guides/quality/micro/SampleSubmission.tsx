import { GuideTypo } from "../../../typography";

const SampleSubmission = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Creating a submission is a two-step wizard that ends in a printable form for
        the samples to travel with.
      </GuideTypo.Lead>

      <GuideTypo.Ordered>
        <GuideTypo.Step>
          <span className="font-semibold">Select a BPR</span> — the produced batch the
          samples are drawn from; each result shows the produced item, batch reference,
          and lot number.
        </GuideTypo.Step>
        <GuideTypo.Step>
          <span className="font-semibold">Sample designation</span> — how many{" "}
          <span className="font-mono">Drums</span>,{" "}
          <span className="font-mono">Pails</span>,{" "}
          <span className="font-mono">Gallons</span>, and{" "}
          <span className="font-mono">Tank</span> are being sampled. Submitting
          generates the SSF as a PDF.
        </GuideTypo.Step>
      </GuideTypo.Ordered>

      <GuideTypo.Note>
        Micro doesn&apos;t record measurements or evaluate specifications — it produces
        the lab submission document. Results that come back are recorded separately,
        e.g. as a <span className="font-semibold">Finished Product</span> examination on
        the lot. (This area is a company-specific customization and may change.)
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default SampleSubmission;
