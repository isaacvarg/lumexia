import { GuideTypo } from "../../../typography";

const MethodPurchases = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A method&apos;s details page shows its visual card and a{" "}
        <span className="font-semibold">Purchases</span> table of every order charged to
        it.
      </GuideTypo.Lead>

      <GuideTypo.Section>The purchases table</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Columns: #, Supplier, Total ($), PO Status, and Accounting Status.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Filter by PO status and accounting status; clicking a row opens that order in{" "}
          <span className="font-semibold">PO Matching</span>.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        This makes a method&apos;s page a quick way to see everything charged to a given
        card or account and jump straight to any of those orders.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default MethodPurchases;
