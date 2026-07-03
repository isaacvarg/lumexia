import { GuideTypo } from "../../../typography";

const WhatIsAPricingExam = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A <span className="font-semibold">pricing examination</span> is an audit of what
        an item costs and what its finished products should sell for.
      </GuideTypo.Lead>

      <GuideTypo.Section>What it does</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Gathers the item&apos;s current cost structure, recalculates each finished
          product&apos;s consumer price to clear a profit margin, then archives a full
          snapshot.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Every examination is kept, so you can always see what a price was, when it
          changed, and why.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        This makes re-pricing deliberate and traceable — instead of guessing, someone
        examines the real cost inputs and dials the numbers until every container clears
        the margin target.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default WhatIsAPricingExam;
