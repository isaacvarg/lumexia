import { GuideTypo } from "../../../../typography";

const OrderingAndReuse = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Presets are ordered by sequence, then quantity — the order you see here
        is the order they appear on every experiment&apos;s Cost tab.
      </GuideTypo.Lead>

      <GuideTypo.List>
        <GuideTypo.Item>
          Deleting a preset reuses the same confirm dialog as deleting a
          research variant elsewhere in the app — a small shared-component
          detail, not a separate confirmation flow.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Because presets are global, adding a batch size for one specific
          product line means every experiment (across all products) will also
          show that line — there&apos;s no per-experiment or per-item scoping.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default OrderingAndReuse;
