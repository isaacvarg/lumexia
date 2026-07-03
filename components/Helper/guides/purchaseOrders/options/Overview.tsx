import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The <span className="font-semibold">Options</span> tab holds the order&apos;s
        high-level actions — the things you do to the order as a whole rather than to
        its lines.
      </GuideTypo.Lead>

      <GuideTypo.Section>Available here</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Duplicate">
          reuse this order as the basis for a new one.
        </GuideTypo.Item>
        <GuideTypo.Item term="Archive">
          take the order off the active board.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
