import { GuideTypo } from "../../../typography";

const StagingAndCompounding = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The work happens in two phases, and who does what is split across three roles
        so no single person both stages a material and clears it.
      </GuideTypo.Lead>

      <GuideTypo.Section>Two phases</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Staging">
          gathering and weighing each material, scanning its lot, and recording the
          weight — then verified by Production Quality.
        </GuideTypo.Item>
        <GuideTypo.Item term="Compounding">
          following the batch&apos;s ordered steps: reading instructions, adding the
          verified materials, and checking off each actionable.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Three roles</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Production">
          stages materials and executes the batch steps.
        </GuideTypo.Item>
        <GuideTypo.Item term="Production Quality">
          performs primary verification of staged materials and flagged steps.
        </GuideTypo.Item>
        <GuideTypo.Item term="Production Quality Secondary">
          performs an independent secondary verification.
        </GuideTypo.Item>
      </GuideTypo.List>
      <GuideTypo.Paragraph>
        If your role has nothing to do at the batch&apos;s current stage, you see a
        read-only overview naming the team it&apos;s waiting on.
      </GuideTypo.Paragraph>

      <GuideTypo.Note>
        A batch with <span className="font-semibold">no scheduled date</span> can&apos;t
        be opened here — it shows <span className="font-semibold">Missing Schedule
        Date</span>. Set the date back in Planning on the batch&apos;s Scheduling card.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default StagingAndCompounding;
