import { GuideTypo } from "../../../typography";

const AddingSupplier = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Creating a supplier takes almost nothing — a name is enough to get a record
        you can start ordering against.
      </GuideTypo.Lead>

      <GuideTypo.Section>The form</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Name">
          the only required field — this alone creates the supplier.
        </GuideTypo.Item>
        <GuideTypo.Item term="Add additional details">
          reveals optional <span className="font-mono">Street 1/2</span>,{" "}
          <span className="font-mono">City</span>,{" "}
          <span className="font-mono">State</span>,{" "}
          <span className="font-mono">Zipcode</span>, and{" "}
          <span className="font-mono">Phone</span> — fill them now or leave blank.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Address and phone, and whether the address prints on purchase orders, can
        always be edited later on the supplier&apos;s{" "}
        <span className="font-semibold">Settings</span> tab.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default AddingSupplier;
