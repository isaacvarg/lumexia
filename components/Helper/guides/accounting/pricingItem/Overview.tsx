import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        An item&apos;s pricing overview gathers its whole pricing story — the last
        examination, how costs and prices have trended, and the full history.
      </GuideTypo.Lead>

      <GuideTypo.Section>On this page</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          A <span className="font-semibold">Last Examined</span> panel, trend charts, and
          a table of every examination.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
