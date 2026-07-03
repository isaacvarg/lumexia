import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A supplier&apos;s detail page pulls together everything about a vendor — what
        you buy, who you deal with, and how they refer to your items — across six
        tabs.
      </GuideTypo.Lead>

      <GuideTypo.Section>The tabs</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Purchases">
          spend analytics and the order history (the default tab).
        </GuideTypo.Item>
        <GuideTypo.Item term="Contacts">
          the people you deal with, each with their own notes.
        </GuideTypo.Item>
        <GuideTypo.Item term="Notes">
          general notes about the supplier.
        </GuideTypo.Item>
        <GuideTypo.Item term="Items">
          per-item buying history and pricing.
        </GuideTypo.Item>
        <GuideTypo.Item term="Aliases">
          the supplier&apos;s names/codes for your items.
        </GuideTypo.Item>
        <GuideTypo.Item term="Settings">
          address, phone, PO printing, and archiving.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
