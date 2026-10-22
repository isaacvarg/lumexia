import Image from "next/image";
import { TbRobot } from "react-icons/tb";

type Props = {
  image?: string;
  name?: string;
  // users.kind; agents and the system user get a bot mark and a label in the tooltip
  kind?: string | null;
  isHoverable?: boolean;
  onClick?: () => void;
};

const kindLabels: Record<string, string> = { agent: "Agent", system: "System" };

const UserIcon = ({ image, name, kind, isHoverable = false, onClick }: Props) => {
  const kindLabel = kind ? kindLabels[kind] : undefined;

  // Agents often have no avatar; show the bot mark instead of a loading skeleton.
  if (!name || (!image && !kindLabel)) {
    return <div className="w-8 h-8 skeleton rounded-full" />;
  }

  return (
    <div className="tooltip" data-tip={kindLabel ? `${name} (${kindLabel})` : name}>
      <div className="indicator">
        {kindLabel && image && (
          <span className="indicator-item indicator-bottom badge badge-xs badge-info p-0.5" aria-label={kindLabel}>
            <TbRobot className="w-3 h-3" />
          </span>
        )}
        <div className="avatar">
          <div
            onClick={onClick}
            className={`
              w-8 rounded-full
              ${isHoverable && `
                cursor-pointer 
                transition-all duration-300 ease-in-out 
                hover:ring-2 hover:ring-primary hover:ring-offset-base-100 hover:ring-offset-2
              `}
            `}
          >
            {image ? (
              <Image
                src={image}
                alt={name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="flex w-8 h-8 items-center justify-center rounded-full bg-info/20 text-info" aria-label={`${name} (${kindLabel})`}>
                <TbRobot className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserIcon;
