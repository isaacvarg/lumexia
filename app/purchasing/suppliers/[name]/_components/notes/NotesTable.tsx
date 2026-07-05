"use client";

import { SupplierNote } from "@/types/SupplierNote";
import { DateTime } from "luxon";
import React, { useMemo } from "react";
import NotesForm from "./NotesForm";
import useDialog from "@/hooks/useDialog";
import Card from "@/components/Card";
import SectionTitle from "@/components/Text/SectionTitle";
import { TbEdit, TbPlus, TbTrashX } from "react-icons/tb";
import supplierNoteActions from "@/actions/purchasing/supplierNoteActions";
import { revalidatePage } from "@/actions/app/revalidatePage";
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import NoteEditForm from "./NoteEditForm";
import { useSupplierDetailSelection, useSupplierDetailActions } from "@/store/supplierDetailSlice";
import Text from "@/components/Text";

const NotesTable = () => {
  const { notes, supplier, selectedNote } = useSupplierDetailSelection();
  const { setSelectedNote } = useSupplierDetailActions();
  const { showDialog } = useDialog();

  const activeNote = useMemo(() => {
    if (selectedNote) return selectedNote;
    if (notes.length > 0) return notes[0];
    return null;
  }, [selectedNote, notes]);

  if (!supplier) return null;

  const handleNoteDelete = async (note: SupplierNote) => {
    await supplierNoteActions.deleteOne({ id: note.id });
    revalidatePage("/purchasing/suppliers/[name]");
    createActivityLog("deleteSupplierNote", "supplier", supplier.id, {
      context: `Note with following content was deleted: ${note.content}`,
    });
    setSelectedNote(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <NotesForm supplier={supplier} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Notes list - 1/3 */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <SectionTitle>Notes</SectionTitle>
            <button className="btn btn-secondary btn-outline" onClick={() => showDialog("createNote")}>
              <TbPlus className="size-4" />
            </button>
          </div>
          <Card.Root>
            <div className="flex flex-col gap-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`flex flex-col gap-y-1 rounded-lg px-4 py-3 cursor-pointer transition-colors border-2 ${
                    activeNote?.id === note.id
                      ? "bg-cararra-100 border-cararra-300"
                      : "border-transparent hover:bg-cararra-50"
                  }`}
                >
                  <p className="font-inter font-medium text-sm line-clamp-2">{note.content}</p>
                  <p className="text-xs text-neutral-400">
                    {DateTime.fromJSDate(new Date(note.createdAt)).toFormat("DD")}
                  </p>
                </div>
              ))}
            </div>
          </Card.Root>
        </div>

        {/* Note detail - 2/3 */}
        <div className="col-span-1 sm:col-span-2">
          {activeNote ? (
            <div className="flex flex-col gap-6">
              <NoteEditForm supplier={supplier} note={activeNote} />

              <div className="flex justify-between items-center">
                <SectionTitle>Note Details</SectionTitle>
                <div className="flex gap-2">
                  <button className="btn btn-secondary btn-outline" onClick={() => showDialog(`updateNote${activeNote.id}`)}>
                    <TbEdit className="size-4" />
                  </button>
                  <button className="btn btn-error btn-outline" onClick={() => handleNoteDelete(activeNote)}>
                    <TbTrashX className="size-4" />
                  </button>
                </div>
              </div>

              <Card.Root>
                <div className="flex flex-col gap-y-4">
                  <div className="flex flex-col gap-y-2">
                    <Text.LabelDataPair
                      label="Created"
                      data={DateTime.fromJSDate(new Date(activeNote.createdAt)).toFormat("DD @ t")}
                    />
                    <Text.LabelDataPair
                      label="Updated"
                      data={DateTime.fromJSDate(new Date(activeNote.updatedAt)).toFormat("DD @ t")}
                    />
                  </div>

                  <div className="flex flex-col gap-y-2">
                    <p className="font-inter font-medium text-lg text-neutral-600">Content</p>
                    <p className="font-inter text-neutral-800">{activeNote.content}</p>
                  </div>
                </div>
              </Card.Root>
            </div>
          ) : (
            <Card.Root>
              <div className="flex items-center justify-center h-full text-neutral-400">
                No notes yet.
              </div>
            </Card.Root>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesTable;
