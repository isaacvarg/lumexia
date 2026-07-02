import { GuideTypo } from "../../../typography";

const DangerActions = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Three high-impact actions live in the Danger zone. Each affects the
        item&apos;s data broadly, so read every confirmation dialog carefully.
      </GuideTypo.Lead>

      <GuideTypo.Section>The actions</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Archive item">
          hide the item from normal views and exclude it from stock calculations,
          while preserving its full history.
        </GuideTypo.Item>
        <GuideTypo.Item term="Change inventory UOM">
          change the unit all of the item&apos;s stock is counted in. Because every
          recorded quantity is expressed in that unit, this also clears the
          item&apos;s discrete conversions.
        </GuideTypo.Item>
        <GuideTypo.Item term="Export data verification package">
          download a ZIP containing the item&apos;s records and attachments.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default DangerActions;
