import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Payments area is the catalog of <span className="font-semibold">payment
        methods</span> — the cards, bank transfers, and checks that purchases are charged
        to.
      </GuideTypo.Lead>

      <GuideTypo.Section>The dashboard</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Every method shows as a visual card styled to its type;{" "}
          <span className="font-semibold">Add Payment Method</span> sits in the header.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Clicking a card opens that method&apos;s details.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
