import { TbRobot } from "react-icons/tb";

// "Agent" / "System" chip shown next to a user's name; renders nothing for people.
const UserKindBadge = ({ kind }: { kind?: string | null }) => {
  if (kind !== "agent" && kind !== "system") return null;

  return (
    <span className={`badge badge-sm badge-soft gap-1 ${kind === "agent" ? "badge-info" : "badge-neutral"}`}>
      <TbRobot className="w-3.5 h-3.5" />
      {kind === "agent" ? "Agent" : "System"}
    </span>
  );
};

export default UserKindBadge;
