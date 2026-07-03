import { GuideTypo } from "../../../typography";

const Settings = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Settings</span> is where you maintain the
        supplier&apos;s own details after creation, and where you archive it.
      </GuideTypo.Lead>

      <GuideTypo.Section>What you can set</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          The address fields and phone.
        </GuideTypo.Item>
        <GuideTypo.Item term="Show address on purchase order">
          controls whether the supplier&apos;s address is printed on generated POs.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        <span className="font-semibold">Archive Supplier</span> lives here and is a{" "}
        <span className="font-semibold">soft delete</span> — the supplier is hidden
        from the list and from new purchase orders, but its history is preserved.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Settings;
