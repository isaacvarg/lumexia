import { GuideTypo } from "../../../../typography";

const CategoryGateAndCron = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Below the three triggers is a per-item-type grid — every category has its
        own on/off toggle (default on), auto-seeded and kept in sync as Item Types
        are renamed elsewhere in Inventory Settings.
      </GuideTypo.Lead>

      <GuideTypo.List>
        <GuideTypo.Item>
          Only items whose Item Type is enabled here are evaluated by any of the
          three triggers — disabling a category skips its items entirely, even if
          they&apos;d otherwise match a trigger.
        </GuideTypo.Item>
        <GuideTypo.Item>
          The cron additionally restricts itself to{" "}
          <span className="font-semibold">Purchased</span> items — produced items
          are never subject to this audit trigger, regardless of category
          settings.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Items that already have an <span className="font-mono">open</span>{" "}
          AuditRequest are skipped, so the cron won&apos;t pile up duplicate
          requests for the same item week over week.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        The save button only activates once something is actually changed — it
        submits every dirty toggle/threshold in one call, not per-field.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default CategoryGateAndCron;
