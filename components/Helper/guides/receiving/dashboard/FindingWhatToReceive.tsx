import { GuideTypo } from "../../../typography";

const FindingWhatToReceive = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        An order only reaches receiving once purchasing has confirmed it — receiving
        never sees a draft or pending order.
      </GuideTypo.Lead>

      <GuideTypo.Section>The two tabs</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Awaiting">
          orders at status <span className="font-semibold">Confirmed / Awaiting
          Delivery</span> <span className="font-semibold">or</span>{" "}
          <span className="font-semibold">Partially Received</span> — anything with
          goods still to book in.
        </GuideTypo.Item>
        <GuideTypo.Item term="Received">
          fully received orders, retained for reference and for reprinting labels.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        An order becomes visible here only when it hits{" "}
        <span className="font-semibold">Confirmed / Awaiting Delivery</span> — advance
        it that far from the purchase order (its <span className="font-semibold">
        Receiving</span> button warns you if it isn&apos;t there yet).{" "}
        <span className="font-semibold">Received</span> and{" "}
        <span className="font-semibold">Partially Received</span> are set by
        receiving, never by hand.
      </GuideTypo.Note>

      <GuideTypo.Section>Other ways in</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          The home dashboard&apos;s <span className="font-semibold">Receivable
          POs</span> panel lists the same awaiting orders, so incoming deliveries are
          visible without opening the module.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default FindingWhatToReceive;
