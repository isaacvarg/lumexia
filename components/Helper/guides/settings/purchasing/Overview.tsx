import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Purchasing Settings</span> holds the global
        purchase order notes — system-admin only, enforced on the server.
      </GuideTypo.Lead>

      <GuideTypo.Section>Where PO notes come from</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Global">
          set here and printed on <span className="font-semibold">every</span> PO PDF,
          in the order listed.
        </GuideTypo.Item>
        <GuideTypo.Item term="Public">
          added on a single order and printed on that order only.
        </GuideTypo.Item>
        <GuideTypo.Item term="Supplier">
          stored on the supplier and printed on every order placed with that supplier.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Blank notes are dropped on save. Removing every note leaves only public and
        supplier notes on the PDF.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
