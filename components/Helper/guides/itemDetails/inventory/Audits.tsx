import { GuideTypo } from "../../../typography";

const Audits = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Audits table is the history of inventory audits performed on the item —
        the physical counts that reconcile recorded stock with what&apos;s actually
        on the shelf. Click any audit to open its details.
      </GuideTypo.Lead>

      <GuideTypo.Section>How a count works</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Counting is scan-driven — scanning a lot takes staff straight to the
          item&apos;s audit view, which lists every lot with its recorded on-hand.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Per lot you can <span className="font-semibold">Adjust</span> (enter the
          counted quantity; the difference is computed for you) or{" "}
          <span className="font-semibold">Deplete</span> (zero it out).
        </GuideTypo.Item>
        <GuideTypo.Item>
          Corrections are never silent overwrites — each one is a transaction
          against the lot, so on-hand is always recomputed from the ledger.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Completing an audit reconciles stock, records who and when, and snapshots
          each change with before-and-after quantities.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Audit requests can be raised manually, or automatically by a reordering
        rule or an audit trigger — auto-raised requests are attributed to the
        Lumexia system user. A broader{" "}
        <span className="font-semibold">discrepancy audit</span> sweeps a whole
        item category rather than one item.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Audits;
