import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A <span className="font-semibold">procurement request</span> is the signal
        that an item needs to be bought. The board is your queue of open requests;
        this <span className="font-semibold">New</span> tab is where fresh requests
        land and where you start one.
      </GuideTypo.Lead>

      <GuideTypo.Section>What this tab shows</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="In System">
          requests still at status <span className="font-mono">Requested</span> for
          items that already exist in Lumexia — waiting to be worked.
        </GuideTypo.Item>
        <GuideTypo.Item term="General">
          placeholder requests for items <span className="font-semibold">not yet</span>{" "}
          in the system, which purchasing must source and add first.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        A request flows through many statuses on its way to Delivered. The Status,
        Supplier, and Calendar tabs are just other lenses on the same board.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
