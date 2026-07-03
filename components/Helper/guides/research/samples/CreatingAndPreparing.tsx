import { GuideTypo } from "../../../typography";

const CreatingAndPreparing = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A sample is created from a specific variant, then worked through a preparation
        checklist as it&apos;s actually mixed.
      </GuideTypo.Lead>

      <GuideTypo.Section>Creating a sample</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Label">a short name for the sample.</GuideTypo.Item>
        <GuideTypo.Item term="Size + UOM">
          the amount made, with a unit (grams, ounces…).
        </GuideTypo.Item>
        <GuideTypo.Item term="Variant">the formulation it&apos;s made from.</GuideTypo.Item>
      </GuideTypo.List>
      <GuideTypo.Paragraph>
        Each sample gets a unique code (<span className="font-mono">S-01</span>). Print
        a <span className="font-semibold">QR label</span> from its card and scan it
        anywhere to deep-link straight back to the sample.
      </GuideTypo.Paragraph>

      <GuideTypo.Section>Preparation</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          A checklist derived from the variant&apos;s materials — toggle each as it&apos;s
          added. When all are added the sample is marked{" "}
          <span className="font-semibold">prepared</span> (stamping who and when), and
          it can be set back to unprepared to correct the record.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        The checklist is a <span className="font-semibold">completion log, not a scale
        reading</span> — it records that each ingredient was added; quantities to weigh
        come from the variant&apos;s concentrations applied to the sample size.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default CreatingAndPreparing;
