import { GuideTypo } from "../../../typography";

const AccessGating = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Three cards — <span className="font-semibold">Company Settings</span>,{" "}
        <span className="font-semibold">Purchasing</span>, and{" "}
        <span className="font-semibold">Manage Users</span> — only appear for
        system admins.
      </GuideTypo.Lead>

      <GuideTypo.Section>How the gate works</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          The landing grid checks <span className="font-mono">isSystemAdmin</span>{" "}
          and, if false, simply leaves those cards out of the array — they
          don&apos;t render greyed-out, they don&apos;t render at all.
        </GuideTypo.Item>
        <GuideTypo.Item>
          <span className="font-semibold">Company Settings</span> and{" "}
          <span className="font-semibold">Purchasing</span> also enforce this
          server-side: hitting <span className="font-mono">/settings/company</span>{" "}
          or <span className="font-mono">/settings/purchasing</span> directly as a
          non-admin redirects you back to <span className="font-mono">/settings</span>.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Manage Users has no equivalent server-side redirect visible on its route —
        the landing card is hidden client-side, but that alone isn&apos;t proof the
        underlying page enforces admin access the same way Company Settings does.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default AccessGating;
