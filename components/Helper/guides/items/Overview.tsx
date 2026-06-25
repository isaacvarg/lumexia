import SectionTitle from "@/components/Text/SectionTitle";
import { GuideTypo } from "../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <p className="text-lg">
        Items are the foundation of inventory — every material, component, and
        product the system tracks starts here. These guides walk through how
        items are created and how their type shapes everything downstream.
      </p>

      <SectionTitle size="small">In this section</SectionTitle>
      <ul className="list-disc list-inside flex flex-col gap-2">
        <li>How to create a new item and what each field controls.</li>
        <li>How an item&apos;s type drives its purchasing and production flows.</li>
      </ul>

      <p className="text-base-content/70">
        Pick a guide above to dive in.
      </p>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
