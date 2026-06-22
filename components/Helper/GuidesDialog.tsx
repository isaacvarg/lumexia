"use client";

import { useState } from "react";
import { TbArrowLeft, TbX } from "react-icons/tb";
import Dialog from "@/components/Dialog";
import SectionTitle from "@/components/Text/SectionTitle";
import useDialog from "@/hooks/useDialog";
import { useHelperSelection } from "@/store/helperSlice";

const GuidesDialog = () => {
  const { current } = useHelperSelection();
  const { resetDialogContext } = useDialog();
  const [selected, setSelected] = useState<number | null>(null);

  const guides = current?.guides ?? [];
  const activeGuide = selected !== null ? guides[selected] : null;
  const GuideContent = activeGuide?.content;

  return (
    <Dialog.Root
      identifier="helper-guides"
      contentClassName="w-[92vw] max-w-[1400px] h-[80vh]"
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 pb-6">
          {activeGuide && (
            <button
              type="button"
              aria-label="Back to guides"
              onClick={() => setSelected(null)}
              className="flex items-center justify-center w-9 h-9 rounded-full text-base-content/70 hover:text-base-content hover:bg-base-200 transition-colors hover:cursor-pointer"
            >
              <TbArrowLeft className="text-xl" />
            </button>
          )}

          <SectionTitle>{activeGuide?.title ?? current?.title ?? "Guides"}</SectionTitle>

          <button
            type="button"
            aria-label="Close"
            onClick={resetDialogContext}
            className="ml-auto flex items-center justify-center w-9 h-9 rounded-full text-base-content/70 hover:text-base-content hover:bg-base-200 transition-colors hover:cursor-pointer"
          >
            <TbX className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {activeGuide && GuideContent ? (
            <div className="max-w-3xl">
              <GuideContent />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {guides.map((guide, index) => (
                <button
                  key={guide.title}
                  type="button"
                  onClick={() => setSelected(index)}
                  className="flex flex-col gap-2 text-left bg-base-200 rounded-xl p-5 hover:bg-base-300 transition-colors hover:cursor-pointer"
                >
                  <span className="font-poppins text-lg font-semibold text-base-content">
                    {guide.title}
                  </span>
                  {guide.description && (
                    <span className="font-poppins text-sm text-base-content/70">
                      {guide.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog.Root>
  );
};

export default GuidesDialog;
