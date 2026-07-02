import { GuideTypo } from "../../../typography";

const ReorderingRule = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A reordering rule automates replenishment: when stock runs low it can raise
        an audit request to verify the quantity on hand and a purchasing request to
        alert the purchasing department. An item can have only one rule.
      </GuideTypo.Lead>

      <GuideTypo.Section>Properties</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Threshold quantity">
          the stock level that triggers the rule.
        </GuideTypo.Item>
        <GuideTypo.Item term="Buffer percent">
          a safety margin applied both above and below the threshold.
        </GuideTypo.Item>
        <GuideTypo.Item term="Create audit request and create purchasing request">
          the two outcomes, toggled independently.
        </GuideTypo.Item>
        <GuideTypo.Item term="Enabled">
          a master switch for the whole rule.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Rules are tested every day at 6:00 AM server time. Note the overlap with
        automated audit triggers: the low-on-hand trigger only fires for items that
        have <span className="font-semibold">no</span> active reordering rule, so
        the two never double up on low stock.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default ReorderingRule;
