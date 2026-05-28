"use client";
import { revalidatePage } from "@/actions/app/revalidatePage";
import { researchActions } from "@/actions/research";
import { Item } from "@/actions/inventory/getAllItems";
import Dialog from "@/components/Dialog";
import SearcherUnmanaged from "@/components/Search/SearcherUnmanaged";
import useDialog from "@/hooks/useDialog";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

type CreateExperimentFormProps = {
  items: Item[];
};

const CreateExperimentForm = ({ items }: CreateExperimentFormProps) => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const { resetDialogContext } = useDialog();

  const handlePick = async (item: Item) => {
    await researchActions.experiments.create({ primarySubjectId: item.id });
    resetDialogContext();
    setInput("");
    revalidatePage("/research/experiments");
  };

  useHotkeys(
    "enter",
    (event) => {
      event.preventDefault();
      if (results[0]) handlePick(results[0]);
    },
    { enableOnFormTags: true, preventDefault: true },
  );

  return (
    <Dialog.Root identifier="createExperiment">
      <Dialog.Title>Create Experiment — Pick Subject Item</Dialog.Title>
      <SearcherUnmanaged
        data={items}
        keys={["name", "flatAliases", "referenceCode"]}
        input={input}
        setInput={setInput}
        onQueryComplete={setResults}
      />

      <div className="grid grid-cols-1 gap-1 overflow-auto max-h-[500px] mt-4">
        {results.map((r, i) => (
          <div
            key={r.id}
            className="bg-accent/20 rounded-xl py-1 px-4 font-poppins text-lg text-base-content hover:bg-accent/40 hover:cursor-pointer"
            onClick={() => handlePick(r)}
          >
            <div className="flex justify-between items-center">
              {`${r.name}${r.aliases.length !== 0 ? ` (${r.flatAliases})` : ""}`}
              {i === 0 && <kbd className="kbd kbd-md">enter</kbd>}
            </div>
          </div>
        ))}
      </div>
    </Dialog.Root>
  );
};

export default CreateExperimentForm;
