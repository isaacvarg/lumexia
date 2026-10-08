import { GuideTypo } from "../../../typography";

const ReceivingItems = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Tap the lines that arrived under <span className="font-semibold">Expected</span>,
        then <span className="font-semibold">Receive</span>. A full-screen flow walks
        through the delivery.
      </GuideTypo.Lead>

      <GuideTypo.Section>The steps</GuideTypo.Section>
      <GuideTypo.Ordered>
        <GuideTypo.Step>
          <span className="font-semibold">Delivery:</span> packing slip number, carrier,
          and a photo or PDF of the packing slip.
        </GuideTypo.Step>
        <GuideTypo.Step>
          <span className="font-semibold">Inspect</span> each line: right item, packaging,
          seals, labels, count. A problem needs a note; add a photo.
        </GuideTypo.Step>
        <GuideTypo.Step>
          <span className="font-semibold">Supplier lots:</span> one row per supplier lot
          on the containers, with quantity and optional expiry and manufacture dates.
        </GuideTypo.Step>
        <GuideTypo.Step>
          <span className="font-semibold">Documents:</span> the COA and other paperwork the
          item needs. Ones already on file for that supplier lot are attached for you.
        </GuideTypo.Step>
        <GuideTypo.Step>
          <span className="font-semibold">Review</span> and receive, then print labels.
        </GuideTypo.Step>
      </GuideTypo.Ordered>

      <GuideTypo.Section>What the order does</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Several supplier lots on one line split it into one line per lot.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Less than expected leaves the rest open on a new line for the next delivery.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Nothing left to receive → <span className="font-semibold">Received</span>;
          otherwise <span className="font-semibold">Partially Received</span>.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Nothing blocks a receipt. Failed inspections, quantity differences, a missing
        supplier lot, missing COAs and lot mismatches are flagged on the delivery and
        the lot instead. Document flags clear once the document is filed.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default ReceivingItems;
