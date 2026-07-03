import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Production Quality is the checkpoint that gates a batch{" "}
        <span className="font-semibold">during manufacturing</span> — the independent
        sign-off of staged materials and flagged steps.
      </GuideTypo.Lead>

      <GuideTypo.Section>The queues</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Awaiting Primary Verification">
          items needing the first-pass check.
        </GuideTypo.Item>
        <GuideTypo.Item term="Awaiting Secondary Verification">
          items needing the independent second-pass check.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        This is separate from the top-level{" "}
        <span className="font-semibold">Quality/QC</span> module (item specs and lot
        examinations) — both are &quot;quality&quot; but they do different jobs. When
        both queues are empty, you get confetti.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
