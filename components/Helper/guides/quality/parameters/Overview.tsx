import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The <span className="font-semibold">Parameters</span> tab holds the reusable
        vocabulary of things quality measures — pH, assay, appearance, and so on.
      </GuideTypo.Lead>

      <GuideTypo.Section>What they&apos;re for</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Define a parameter once, attach it to items as specifications, and record
          values against it in examinations.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
