import { GuideTypo } from "../../../typography";

const ReceivingItems = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        In the <span className="font-semibold">Receivables</span> section, select one
        or more lines — two actions appear for booking them in.
      </GuideTypo.Lead>

      <GuideTypo.Section>Full vs partial</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Fully Receive">
          books in the entire ordered quantity of each selected line.
        </GuideTypo.Item>
        <GuideTypo.Item term="Partially Receive">
          gives each line a <span className="font-semibold">Quantity</span> field —
          prefilled with the full ordered amount and labeled with the purchase unit —
          for when a delivery arrives incomplete.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>What the order does</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Receive every remaining line → order moves to{" "}
          <span className="font-semibold">Received</span>.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Receive only some → order moves to{" "}
          <span className="font-semibold">Partially Received</span> and stays on the
          Awaiting tab until the rest arrives.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Receiving <span className="font-semibold">less</span> than ordered splits the
        line: the received amount is booked in, and a{" "}
        <span className="font-semibold">new line</span> is created for the remainder
        so it stays outstanding on Awaiting. Receiving also updates any linked
        procurement requests to <span className="font-semibold">Delivered</span> or{" "}
        <span className="font-semibold">Partial Delivery</span>.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default ReceivingItems;
