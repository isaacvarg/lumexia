import { GuideTypo } from "../../../typography";

const NoteVisibility = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        An order supports three kinds of note, and the difference is entirely about
        visibility — who ends up reading them.
      </GuideTypo.Lead>

      <GuideTypo.Section>The three types</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Internal">
          internal use only — these never appear on any PO PDF.
        </GuideTypo.Item>
        <GuideTypo.Item term="Public">
          print on the PDF for <span className="font-semibold">this specific</span>{" "}
          order.
        </GuideTypo.Item>
        <GuideTypo.Item term="Supplier">
          stored on the supplier and print on{" "}
          <span className="font-semibold">every</span> order placed with that
          supplier.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Use supplier notes for standing instructions that apply to a vendor across all
        orders, and public notes for something specific to a single order.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default NoteVisibility;
