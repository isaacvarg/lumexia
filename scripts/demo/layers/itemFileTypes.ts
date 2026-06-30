import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { DEMO_ITEM_FILE_TYPES } from '../data/itemFileTypes';

// seeds the demo item file types. ItemFileType is not a static record and nothing
// downstream consumes these ids, so they're created fresh with new uuids.
export const seedItemFileTypes = async (): Promise<void> => {
  await insert(
    'itemFileType',
    DEMO_ITEM_FILE_TYPES.map((t) => ({
      id: uuid(),
      name: t.name,
      abbreviaton: t.abbreviaton,
      description: t.description,
      bgColor: t.bgColor,
      textColor: t.textColor,
    })),
  );
};
