import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Compounding is the shop-floor half of production — where staff stage a
        batch&apos;s materials and then work its steps to make it. It picks up once a
        batch is queued and scheduled.
      </GuideTypo.Lead>

      <GuideTypo.Section>The dashboard</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          A <span className="font-semibold">This Week / Next Week</span> schedule grid
          of batches due in the production days ahead.
        </GuideTypo.Item>
        <GuideTypo.Item term="All Compoundables">
          every batch in a workable status —{" "}
          <span className="font-semibold">Queued</span>,{" "}
          <span className="font-semibold">Staging Materials</span>, or{" "}
          <span className="font-semibold">Compounding</span>.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Opening a batch shows the view for its status: a queued batch offers{" "}
        <span className="font-semibold">Begin Staging</span>, a staging batch shows the
        staging panels, and a compounding batch shows the steps.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
