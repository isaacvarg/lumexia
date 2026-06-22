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
    icon: <TbBrandGithub />,
  },
  {
    label: "Isaac Vargas",
    href: "https://isaacvargas.dev",
    icon: <TbUser />,
  },
  {
    label: "Lumexia Docs",
    href: "https://lumexia.isaacvargs.dev",
    icon: <TbFileText />,
  },
];
