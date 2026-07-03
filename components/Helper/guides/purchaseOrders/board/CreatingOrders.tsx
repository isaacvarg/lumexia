import { GuideTypo } from "../../../typography";

const CreatingOrders = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        There are two ways to start an order, and both open it as a{" "}
        <span className="font-semibold">Draft</span> ready to add items to.
      </GuideTypo.Lead>

      <GuideTypo.Section>From the board</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Press <span className="font-semibold">New Purchase Order</span> (or{" "}
          <span className="font-mono">ctrl + c</span>), then pick a supplier — typing
          filters the list and <span className="font-mono">enter</span> selects the
          first match.
        </GuideTypo.Item>
        <GuideTypo.Item>
          The order opens empty, for the chosen supplier.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>From a request</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          On a procurement request, use the{" "}
          <span className="font-semibold">Linked POs</span> card to add a new order.
        </GuideTypo.Item>
        <GuideTypo.Item>
          It&apos;s created for the request&apos;s supplier and{" "}
          <span className="font-semibold">seeded with the requested item</span> as a
          first line, then linked back so order and request stay in sync.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Every PO belongs to exactly one supplier — you choose it at creation, and it
        determines which supplier aliases and supplier notes apply to the order.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default CreatingOrders;
