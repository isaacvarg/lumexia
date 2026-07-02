"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

  // The view rendered below the tiles: the selected guide's content, or the
  // section's own overview when nothing is selected.
  const ActiveContent = activeGuide?.content ?? current?.overview ?? null;
  const activeKey = selected ?? "overview";

  // Reset to the section overview whenever the active section changes, so
  // reopening on a different section starts at that section's starting view.
  useEffect(() => {
    setSelected(null);
  }, [current?.id]);

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

        {/* Tiles — always visible; clicking one swaps the content below. */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 shrink-0">
          {guides.map((guide, index) => {
            const isActive = selected === index;
            return (
              <button
                key={guide.title}
                type="button"
                onClick={() => setSelected(index)}
                className={`flex flex-col gap-2 text-left rounded-xl p-5 transition-colors hover:cursor-pointer ${
                  isActive
                    ? "bg-base-300 ring-2 ring-accent"
                    : "bg-base-200 hover:bg-base-300"
                }`}
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
            );
          })}
        </div>

        {/* Content — section overview, or the selected guide, with a swap animation. */}
        <div className="mt-6 pt-6 border-t border-base-content/10 flex-1 overflow-y-auto px-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="max-w-4xl mx-auto"
            >
              {ActiveContent ? (
                <ActiveContent />
              ) : (
                <p className="font-poppins text-base-content/70">
                  Select a guide above to get started.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Dialog.Root>
  );
};

export default GuidesDialog;
