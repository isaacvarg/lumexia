import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Cost tab projects what each variant would cost to produce{" "}
        <span className="font-semibold">before any batch is made</span> — estimates
        built from current material prices and a few overhead settings.
      </GuideTypo.Lead>

      <GuideTypo.Section>What it answers</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Is this formula affordable, and how does it compare to what the item costs to
          make today?
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
