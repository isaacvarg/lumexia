import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A <span className="font-semibold">sample</span> is a physical batch made from a
        variant — where a variant is the formula on paper, a sample is a jar actually
        mixed, prepared, labeled, and measured.
      </GuideTypo.Lead>

      <GuideTypo.Section>The focused view</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Opening a sample drills into a focused view with{" "}
          <span className="font-semibold">Preparation</span>,{" "}
          <span className="font-semibold">Measurement</span>,{" "}
          <span className="font-semibold">Notes</span>, and{" "}
          <span className="font-semibold">Files</span> modes.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
