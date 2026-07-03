import { GuideTypo } from "../../typography";

const ThisDashboard = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        This page is a grid of independent panel widgets, not a fixed layout —
        what you see here is your own configured dashboard.
      </GuideTypo.Lead>

      <GuideTypo.List>
        <GuideTypo.Item>
          Each panel is enabled/disabled and ordered per user, stored as your
          home-dashboard layout and rendered from a shared panel registry —
          two users can see completely different dashboards.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Panels can span 1, 2, or 3 grid columns depending on how much room
          their content needs.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Configure which panels show and their order from your profile:{" "}
          <span className="font-mono">Settings → (your avatar) → Dashboard</span>.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default ThisDashboard;
