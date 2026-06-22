"use client";

import { TbBook2 } from "react-icons/tb";
import { useHelperSelection } from "@/store/helperSlice";
import { helperLinks } from "./helper.links";

const Helper = () => {
  const { current } = useHelperSelection();

  const title = current?.title ?? "helper";
  const guides = current?.guides.length ?? 0;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 w-[640px] max-w-[calc(100vw-2rem)] pl-6 pr-3 py-2 rounded-full bg-base-100/80 backdrop-blur-md border border-base-content/10 text-base-content shadow-lg font-poppins">
      <div className="tooltip flex-1 min-w-0" data-tip="View guides for this section">
        <button
          type="button"
          className="flex items-center gap-3 w-full px-3 py-2 rounded-full text-left hover:bg-base-200 transition-colors hover:cursor-pointer"
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
