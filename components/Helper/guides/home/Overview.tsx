import { GuideTypo } from "../../typography";
import { helperLinks } from "../../helper.links";

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

      <GuideTypo.Links links={helperLinks} />

      <GuideTypo.Note>
        This guide is the default — it&apos;s what the Helper bar shows here on
        the dashboard, and whenever you&apos;re on a page that doesn&apos;t
        have its own guide yet.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
