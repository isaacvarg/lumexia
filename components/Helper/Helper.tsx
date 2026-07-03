"use client";

import { useContext } from "react";
import { TbBook2 } from "react-icons/tb";
import { useHelperSelection } from "@/store/helperSlice";
import useDialog from "@/hooks/useDialog";
import { DialogContext } from "@/context/DialogContext";
import { helperLinks } from "./helper.links";
import GuidesDialog from "./GuidesDialog";

const GUIDES_DIALOG = "helper-guides";

const Helper = () => {
  const { current } = useHelperSelection();
  const { showDialog } = useDialog();
  const { isDialogOpen, activeDialogIdentifier } = useContext(DialogContext);

  const title = current?.title ?? "helper";
  const guides = current?.guides.length ?? 0;

  const isGuidesOpen = isDialogOpen && activeDialogIdentifier === GUIDES_DIALOG;
  const zClass = isGuidesOpen ? "z-[60]" : "z-50";

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 ${zClass} flex items-center gap-4 w-160 max-w-[calc(100vw-2rem)] pl-6 pr-3 py-2 rounded-full bg-base-100/80 backdrop-blur-md border border-base-content/10 text-base-content shadow-lg font-poppins`}>
      <GuidesDialog />

      <div className="tooltip flex-1 min-w-0" data-tip="View guides for this section">
        <button
          type="button"
          onClick={() => guides > 0 && showDialog(GUIDES_DIALOG)}
          disabled={guides === 0}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-full text-left hover:bg-base-200 transition-colors hover:cursor-pointer disabled:hover:bg-transparent disabled:hover:cursor-default"
        >
          {guides > 0 && (
            <div className="relative flex items-center shrink-0">
              <TbBook2 className="text-xl" />
              <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-semibold rounded-full bg-accent text-accent-content">
                {guides}
              </span>
            </div>
          )}
          <span className="flex-1 truncate">{title}</span>
        </button>
      </div>

      <div className="flex items-center gap-1">
        {helperLinks.map((link) => (
          <div key={link.label} className="tooltip" data-tip={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="flex items-center justify-center w-9 h-9 rounded-full text-lg text-base-content/70 hover:text-base-content hover:bg-base-200 transition-colors"
            >
              {link.icon}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Helper;
