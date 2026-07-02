import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The R&amp;D tab gathers every experiment whose{" "}
        <span className="font-semibold">subject</span> is this item, shown as cards
        you can click through to the experiment. It&apos;s how you see, at a glance,
        what research has been run against the item.
      </GuideTypo.Lead>
      <GuideTypo.Note>
        Each experiment studies exactly one subject item, and the item&apos;s cost
        projections key off it. See the guide for how to start a new experiment
        pre-filled with this item.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
