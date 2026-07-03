import { GuideTypo } from "../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Lumexia</span> is a manufacturing,
        quality, and inventory management system — it unifies procurement,
        receiving, inventory, production, quality, research &amp; development,
        and accounting into one traceable record, from the first purchase order
        to the finished, priced product.
      </GuideTypo.Lead>

      <GuideTypo.Section>Who built it, and why</GuideTypo.Section>
      <GuideTypo.Paragraph>
        Lumexia is built by a former formulations and analytical chemist who
        worked for a white-label cosmetic and bath-product manufacturer, to
        replace the paper forms and spreadsheets that job ran on — the design
        leans toward that industry&apos;s vocabulary and workflows (batches,
        compounding, micro testing) rather than generic ERP terms. The
        production surge during COVID-era hand-sanitizer manufacturing is one
        of the concrete problems it was built to solve: getting recipes,
        batches, and lots traceable without paper.
      </GuideTypo.Paragraph>

      <GuideTypo.Note>
        This guide is the default — it&apos;s what the Helper bar shows here on
        the dashboard, and whenever you&apos;re on a page that doesn&apos;t
        have its own guide yet.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
