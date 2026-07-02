import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Danger zone, reached from a button at the bottom of the page, holds the
        item&apos;s irreversible or high-impact actions.
      </GuideTypo.Lead>
      <GuideTypo.Note>
        Each action affects the item&apos;s data broadly — read every confirmation
        dialog carefully before proceeding. See the guides for what each one does.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
