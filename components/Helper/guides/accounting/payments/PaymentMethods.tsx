import { GuideTypo } from "../../../typography";

const PaymentMethods = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        There is <span className="font-semibold">no separate payment record</span> in
        Lumexia — a payment is really a purchase order whose accounting record points at
        one of these methods.
      </GuideTypo.Lead>

      <GuideTypo.Section>Adding a method</GuideTypo.Section>
      <GuideTypo.Paragraph>
        <span className="font-semibold">Add Payment Method</span> opens a short wizard
        (Type → Info → Colors) with a live card preview. Types are Visa, Mastercard, Amex,
        bank transfer, or check.
      </GuideTypo.Paragraph>
      <GuideTypo.List>
        <GuideTypo.Item term="Required">
          Method Name, Identifier, Limit, Associated Name.
        </GuideTypo.Item>
        <GuideTypo.Item term="Optional">
          Expiry, Account Ending In.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        <span className="font-semibold">Modify</span> on a method&apos;s page reopens the
        same wizard pre-filled, updating the existing method instead of creating a new
        one.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default PaymentMethods;
