import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { pick, randomPastDate, stamp } from '../lib/timeline';
import { DEMO_ITEM_NOTES } from '../data/itemNotes';
import { DemoItem } from './items';
import { DemoUser } from './users';
import { DemoItemNoteType } from './itemNoteTypes';

// attaches the hand-written staff notes to their items. Notes are keyed by item
// name and note-type key in the data file, so we resolve those to ids here. Any
// typo'd name or key throws immediately, which keeps the demo data honest.
export const seedItemNotes = async (
  items: DemoItem[],
  users: DemoUser[],
  noteTypes: DemoItemNoteType[],
): Promise<void> => {
  const itemIdByName = new Map(items.map((i) => [i.name, i.id]));
  const noteTypeIdByKey = new Map(noteTypes.map((t) => [t.key, t.id]));

  const rows = DEMO_ITEM_NOTES.map((note) => {
    const itemId = itemIdByName.get(note.itemName);
    if (!itemId) {
      throw new Error(`😭 itemNote references unknown item "${note.itemName}". Check data/items.ts for the exact name.`);
    }

    const noteTypeId = noteTypeIdByKey.get(note.noteTypeKey);
    if (!noteTypeId) {
      throw new Error(`😭 itemNote uses unknown noteTypeKey "${note.noteTypeKey}". Check data/itemNoteTypes.ts.`);
    }

    return {
      id: uuid(),
      itemId,
      noteTypeId,
      userId: pick(users).id,
      content: note.content,
      ...stamp(randomPastDate(1, 150)),
    };
  });

  await insert('itemNote', rows);
};
