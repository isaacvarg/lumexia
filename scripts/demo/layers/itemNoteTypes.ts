import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { DEMO_ITEM_NOTE_TYPES } from '../data/itemNoteTypes';

export interface DemoItemNoteType {
  id: string;
  key: string;
  name: string;
}

// seeds the café-flavored note types. ItemNoteType is not a static record, so
// (like itemTypes) these are created fresh with new uuids and handed downstream
// so the itemNotes layer can resolve a note's type by its stable `key`.
export const seedItemNoteTypes = async (): Promise<DemoItemNoteType[]> => {
  const noteTypes: DemoItemNoteType[] = DEMO_ITEM_NOTE_TYPES.map((t) => ({
    id: uuid(),
    key: t.key,
    name: t.name,
  }));

  await insert(
    'itemNoteType',
    DEMO_ITEM_NOTE_TYPES.map((t, i) => ({
      id: noteTypes[i].id,
      name: t.name,
      description: t.description,
      bgColor: t.bgColor,
      textColor: t.textColor,
    })),
  );

  return noteTypes;
};
