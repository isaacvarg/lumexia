import { ReactNode } from "react";

export type GuideLink = {
  label: string;
  href: string;
  icon: ReactNode;
};

const Links = ({ links }: { links: GuideLink[] }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-soft btn-sm rounded-full"
        >
          {link.icon}
          {link.label}
        </a>
      ))}
    </div>
  );
};

export default Links;
