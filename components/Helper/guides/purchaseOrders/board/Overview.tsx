import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A <span className="font-semibold">purchase order</span> is a commitment to
        buy specific items, in specific quantities, from one supplier. This board is
        the table of every active order — newest first, with archived orders hidden.
      </GuideTypo.Lead>

      <GuideTypo.Section>Reading a row</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="PO #">
          the order&apos;s reference number, assigned automatically in sequence.
        </GuideTypo.Item>
        <GuideTypo.Item term="Status">
          where the order sits in its pipeline, as a colored tag.
        </GuideTypo.Item>
        <GuideTypo.Item term="Accounting">
          the state of its accounting detail — blank until accounting is started.
        </GuideTypo.Item>
        <GuideTypo.Item term="Total">
          <span className="font-mono">Σ (quantity × price)</span> across every line.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Filter the table by <span className="font-semibold">Supplier</span>,{" "}
        <span className="font-semibold">Status</span>, and{" "}
        <span className="font-semibold">Accounting</span>; click a row to open the
        order.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
