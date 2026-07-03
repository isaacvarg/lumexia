import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Examinations list is every recorded test event — each with its reference
        number, item, who conducted it, type, and status.
      </GuideTypo.Lead>

      <GuideTypo.Section>What&apos;s here</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Open an examination to see its full record, read-only.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Start new ones from a lot, a scan, or bulk entry — see the guides.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
