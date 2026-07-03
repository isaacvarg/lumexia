import { GuideTypo } from "../../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Production Settings → Vessels</span>{" "}
        shows compounding vessels as cards — each one an Equipment record
        decorated with capacity and cost.
      </GuideTypo.Lead>

      <GuideTypo.Section>Creating a vessel</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Equipment">
          pick an existing Equipment record — a vessel isn&apos;t a separate
          catalog, it&apos;s built on top of one.
        </GuideTypo.Item>
        <GuideTypo.Item term="Capacity Minimum / Maximum (lb)">
          the batch size range this vessel can run, both required.
        </GuideTypo.Item>
        <GuideTypo.Item term="Operational Cost ($/hour)">
          required; the hourly cost of running this vessel.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        The card shows <span className="font-mono">min - max lb Capacity</span>{" "}
        and <span className="font-mono">$/hour</span> — the operational cost
        strongly implies it feeds production cost/time estimation elsewhere,
        though that consuming calculation lives outside Settings.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
