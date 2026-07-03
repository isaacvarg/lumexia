import { ReactNode } from "react";
import { TbBrandGithub, TbFileText, TbUser } from "react-icons/tb";

export type HelperLink = {
  label: string;
  href: string;
  icon: ReactNode;
};

export const helperLinks: HelperLink[] = [
  {
    label: "Lumexia GitHub Repo",
    href: "https://github.com/isaacvarg/lumexia",
    icon: <TbBrandGithub className="size-4" />,
  },
  {
    label: "Isaac Vargas",
    href: "https://isaacvargas.dev",
    icon: <TbUser className="size-4" />,
  },
  {
    label: "Lumexia Docs",
    href: "https://lumexia.isaacvargs.dev",
    icon: <TbFileText className="size-4" />,
  },
];
