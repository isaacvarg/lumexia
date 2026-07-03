import { GuideTypo } from "../../../../typography";

const CapacityAndCost = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A vessel card is read-only display plus a click-to-edit dialog — there&apos;s
        no separate detail page.
      </GuideTypo.Lead>

      <GuideTypo.List>
        <GuideTypo.Item>
          Click any vessel card, or &quot;Add Vessel,&quot; to open the same
          form — creating and editing share one dialog.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Because the Equipment field is a select over the full Equipment list,
          add the physical equipment on the Equipment tab first if it
          doesn&apos;t already exist.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Capacity is a range (min/max), not a single number — useful for
          vessels that can run smaller batches efficiently but have a hard
          upper limit.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default CapacityAndCost;
