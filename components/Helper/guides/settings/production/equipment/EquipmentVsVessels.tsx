import { GuideTypo } from "../../../../typography";

const EquipmentVsVessels = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Not every piece of equipment is a compounding vessel — Equipment is the
        broader catalog, Vessels is a decorated subset.
      </GuideTypo.Lead>

      <GuideTypo.List>
        <GuideTypo.Item>
          Adding a piece of equipment here doesn&apos;t make it usable for
          compounding by itself — it just registers the physical asset.
        </GuideTypo.Item>
        <GuideTypo.Item>
          To use it as a compounding vessel, go to the Vessels tab and point a
          new vessel at this equipment record, adding capacity and operational
          cost.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default EquipmentVsVessels;
