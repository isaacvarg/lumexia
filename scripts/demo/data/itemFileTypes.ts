export interface ItemFileTypeData {
  name: string;
  abbreviaton: string; // matches the (misspelled) ItemFileType schema field
  description: string;
  bgColor: string; // hex, badge background
  textColor: string; // hex, badge text
}

// Demo file types layered on top of the init seed. The init seed already provides
// COA/SDS/TDS, so the demo only adds types unique to the Portals & Paws data set.
// ItemFileType is not a static record, so these are created fresh with new uuids
// in the layer.
export const DEMO_ITEM_FILE_TYPES: ReadonlyArray<ItemFileTypeData> = [
  {
    name: 'Product Image',
    abbreviaton: 'IMG',
    description: 'an image of the product',
    bgColor: '#b7bdf8',
    textColor: '#1e2030',
  },
];
