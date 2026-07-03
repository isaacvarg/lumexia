import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Settings</span> is a grid of cards, each
        opening one configuration area. What you see on the grid depends on who you
        are — some cards only exist for system admins.
      </GuideTypo.Lead>

      <GuideTypo.Section>The cards</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Inventory">
          item types, alias/file types, units of measurement, and the weekly
          inventory-audit trigger rules.
        </GuideTypo.Item>
        <GuideTypo.Item term="Production">
          the equipment catalog, compounding vessels, and step actionable types.
        </GuideTypo.Item>
        <GuideTypo.Item term="Research">
          the global cost-overhead formula and the batch-size presets used on every
          experiment&apos;s Cost tab.
        </GuideTypo.Item>
        <GuideTypo.Item term="Manage Users">
          add users, edit roles — system-admin only.
        </GuideTypo.Item>
        <GuideTypo.Item term="Company Settings">
          company info and images — system-admin only.
        </GuideTypo.Item>
        <GuideTypo.Item term="Fixes">
          a maintenance panel for repairing missing pricing data, PO accounting
          detail, and PO consumption links — a data-repair tool, not day-to-day
          configuration.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
