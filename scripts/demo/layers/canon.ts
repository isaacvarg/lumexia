import { db } from '../lib/db';
import { DemoUser } from './users';
import { DemoSupplier } from './suppliers';
import { DemoItem } from './items';
import { DemoItemType } from './itemTypes';
import { refs } from '../lib/refs';
import { canonShapes } from '@/configs/staticRecords/canonShapes';
import { canonSubjectTypes } from '@/configs/staticRecords/canonSubjectTypes';
import { canonDependencyKinds } from '@/configs/staticRecords/canonDependencyKinds';
import { canonCapabilities } from '@/configs/staticRecords/canonCapabilities';
import { canonSourceTypes } from '@/configs/staticRecords/canonSourceTypes';
import { proposeEdit, proposeSourceAcceptance, reviewChangeRequest } from '@/lib/canon/changeRequests';

// Canon demo: a small allergen + labelling graph, with artifacts created through the real
// change request engine so versions, lineage and statuses are genuine. It leaves the demo
// login with something in each state: current, a supplier conflict, a stale claim, and a
// change waiting for review.

const ALLERGENS = ['Milk', 'Eggs', 'Gluten', 'Tree Nuts', 'Soy', 'Sesame'];

// ingredient → allergens, for the ingredients used by the two demo recipes
const INGREDIENT_ALLERGENS: Record<string, string[]> = {
  'Astral Espresso Beans': [],
  'Moon-Grazed Whole Milk': ['Milk'],
  'Starlight Cane Sugar': [],
  'Powdered Underdark Flour': ['Gluten'],
  'Dried Flumph Meringue Powder': ['Eggs'],
  'Chult Vanilla Pods': [],
  'Mimic Jam Fruit Base': [],
};

const RECIPES = {
  espresso: {
    name: 'Freshly Brewed Astral Espresso',
    listing: ['Brewed Astral Espresso (Water, Coffee)', 'Whole Milk', 'Cane Sugar'],
    allergens: ['Milk'],
  },
  macaron: {
    name: 'The Mimic Macaron',
    listing: ['Cane Sugar', 'Wheat Flour', 'Dried Egg White', 'Fruit Jam Base', 'Vanilla'],
  },
};

const DATA_TYPES = {
  supplierAllergens: {
    name: 'Supplier Allergen Statement',
    description: 'Allergens a supplier declares for a material, with their document as evidence.',
    shapeId: canonShapes.tagSet,
    subjectTypeId: canonSubjectTypes.itemSupplier,
    shapeConfig: { options: ALLERGENS },
    requiresEvidence: true,
    scope: 'Ingredients',
    position: { x: 0, y: 0 },
  },
  allergens: {
    name: 'Allergens',
    description: 'The allergens we stand behind for a material.',
    shapeId: canonShapes.tagSet,
    subjectTypeId: canonSubjectTypes.item,
    shapeConfig: { options: ALLERGENS },
    reverifyAfterDays: 365,
    scope: 'Ingredients',
    position: { x: 320, y: 0 },
  },
  menuAllergens: {
    name: 'Menu Allergens',
    description: 'Allergen callouts shown on the menu for a recipe.',
    shapeId: canonShapes.tagSet,
    subjectTypeId: canonSubjectTypes.item,
    shapeConfig: { options: ALLERGENS },
    requiresDifferentReviewer: true,
    scope: 'Recipes',
    position: { x: 640, y: 0 },
  },
  officialBom: {
    name: 'Official BOM',
    description: 'The bill of materials of the active MBPR.',
    shapeId: canonShapes.billOfMaterials,
    subjectTypeId: canonSubjectTypes.item,
    resolverKey: 'mbpr.activeBom',
    scope: 'Recipes',
    position: { x: 320, y: 200 },
  },
  ingredientListing: {
    name: 'Ingredient Listing',
    description: 'Ingredients in descending order of predominance, as printed.',
    shapeId: canonShapes.orderedList,
    subjectTypeId: canonSubjectTypes.item,
    requiresDifferentReviewer: true,
    scope: 'Recipes',
    position: { x: 640, y: 200 },
  },
  shelfLabel: {
    name: 'Shelf Label',
    description: 'Copy for the shelf label of a sold size.',
    shapeId: canonShapes.blockList,
    subjectTypeId: canonSubjectTypes.finishedProduct,
    externalKey: '_shelf_label_copy',
    position: { x: 960, y: 200 },
  },
  menuDescription: {
    name: 'Menu Description',
    description: 'The description printed on the menu and the website.',
    shapeId: canonShapes.richText,
    subjectTypeId: canonSubjectTypes.item,
    externalKey: '_menu_description',
    scope: 'Recipes',
    position: { x: 640, y: 400 },
  },
} as const;

type DataTypeKey = keyof typeof DATA_TYPES;

export const seedCanon = async (
  users: DemoUser[],
  suppliers: DemoSupplier[],
  items: DemoItem[],
  itemTypes: DemoItemType[],
): Promise<void> => {
  const user = (name: string) => {
    const found = users.find((u) => u.name === name);
    if (!found) throw new Error(`😭 canon layer references unknown demo user "${name}".`);
    return found.id;
  };
  const itemId = (name: string) => {
    const found = items.find((i) => i.name === name);
    if (!found) throw new Error(`😭 canon layer references unknown item "${name}".`);
    return found.id;
  };
  const itemTypeId = (name: string) => itemTypes.find((t) => t.name === name)?.id;

  const demo = user('Demo');
  const morgra = user('Morgra Hearthbreaker');
  const kallista = user('Kallista Ashworth');
  const modron = user('Modron Whiskers');
  const valen = user('Valen Duskwalker');

  // ── teams ─────────────────────────────────────────────────────────────────
  const quality = await db.canonTeam.create({
    data: {
      name: 'Quality & Compliance',
      description: 'Owns allergen, formula and labelling accuracy.',
      members: { create: [morgra, kallista, demo].map((userId) => ({ userId })) },
    },
  });
  const marketing = await db.canonTeam.create({
    data: {
      name: 'Menu & Marketing',
      description: 'Writes menu, label and website copy.',
      members: { create: [modron, demo].map((userId) => ({ userId })) },
    },
  });
  console.log('  +    2 canonTeam');

  // ── data types ────────────────────────────────────────────────────────────
  const types = {} as Record<DataTypeKey, string>;
  for (const [key, def] of Object.entries(DATA_TYPES) as [DataTypeKey, (typeof DATA_TYPES)[DataTypeKey]][]) {
    const scopeTypeId = 'scope' in def ? itemTypeId(def.scope) : undefined;
    const created = await db.canonDataType.create({
      data: {
        name: def.name,
        description: def.description,
        shapeId: def.shapeId,
        subjectTypeId: def.subjectTypeId,
        shapeConfig: 'shapeConfig' in def ? def.shapeConfig : undefined,
        resolverKey: 'resolverKey' in def ? def.resolverKey : null,
        externalKey: 'externalKey' in def ? def.externalKey : null,
        requiresEvidence: 'requiresEvidence' in def ? def.requiresEvidence : false,
        requiresDifferentReviewer: 'requiresDifferentReviewer' in def ? def.requiresDifferentReviewer : false,
        reverifyAfterDays: 'reverifyAfterDays' in def ? def.reverifyAfterDays : null,
        recordStatusId: refs.recordStatuses.active,
        canvasX: def.position.x,
        canvasY: def.position.y,
        itemTypes: scopeTypeId ? { create: [{ itemTypeId: scopeTypeId }] } : undefined,
      },
    });
    types[key] = created.id;
  }
  console.log(`  + ${Object.keys(types).length.toString().padStart(4)} canonDataType`);

  await db.canonDataTypeDependency.createMany({
    data: [
      { parentId: types.supplierAllergens, childId: types.allergens, kindId: canonDependencyKinds.suppliers },
      { parentId: types.allergens, childId: types.menuAllergens, kindId: canonDependencyKinds.activeBom },
      { parentId: types.officialBom, childId: types.ingredientListing, kindId: canonDependencyKinds.sameSubject },
      { parentId: types.ingredientListing, childId: types.shelfLabel, kindId: canonDependencyKinds.filledItem },
    ],
  });

  // editors and reviewers
  const team = (dataTypeId: string, capabilityId: string, teamId: string) => ({ dataTypeId, capabilityId, teamId });
  const person = (dataTypeId: string, capabilityId: string, userId: string) => ({ dataTypeId, capabilityId, userId });
  const { edit, review } = canonCapabilities;
  await db.canonDataTypeTeamPermission.createMany({
    data: [
      team(types.supplierAllergens, edit, quality.id), team(types.supplierAllergens, review, quality.id),
      team(types.allergens, edit, quality.id), team(types.allergens, review, quality.id),
      team(types.menuAllergens, edit, marketing.id), team(types.menuAllergens, review, quality.id),
      team(types.officialBom, review, quality.id),
      team(types.ingredientListing, edit, marketing.id), team(types.ingredientListing, review, quality.id),
      team(types.shelfLabel, edit, marketing.id), team(types.shelfLabel, review, quality.id),
      team(types.menuDescription, edit, marketing.id), team(types.menuDescription, review, marketing.id),
    ],
  });
  // purchasing records what suppliers state
  await db.canonDataTypeUserPermission.createMany({
    data: [person(types.supplierAllergens, edit, valen)],
  });

  // ── artifacts, through the engine ─────────────────────────────────────────
  const item = (name: string) => ({ kind: 'item' as const, itemId: itemId(name) });
  const approve = (changeRequestId: string, reviewerId: string, comment?: string) =>
    reviewChangeRequest(reviewerId, { changeRequestId, approved: true, comment: comment ?? null });
  const supplierDoc = (note: string, sourceDate: string) => [
    { sourceTypeId: canonSourceTypes.supplierDocument, note, sourceDate: new Date(sourceDate) },
  ];

  // material allergens (Kallista is an editor and reviewer, so these self-approve)
  for (const [name, allergens] of Object.entries(INGREDIENT_ALLERGENS)) {
    await proposeEdit(kallista, {
      dataTypeId: types.allergens,
      subject: item(name),
      proposedContent: { tags: allergens },
      reason: 'Initial review of the supplier specification.',
      sources: supplierDoc('Specification sheet, allergen statement', '2026-01-15'),
    });
  }

  // two suppliers of the milk disagree: one also declares soy (shared line) → conflict
  const [firstSupplier, secondSupplier] = suppliers;
  const milk = itemId('Moon-Grazed Whole Milk');
  const statements: [DemoSupplier, string[], string][] = [
    [firstSupplier, ['Milk'], 'SDS section 3 and allergen declaration'],
    [secondSupplier, ['Milk', 'Soy'], 'Allergen declaration: processed on a line shared with soy'],
  ];
  for (const [supplier, allergens, note] of statements) {
    const cr = await proposeEdit(valen, {
      dataTypeId: types.supplierAllergens,
      subject: { kind: 'itemSupplier', itemId: milk, supplierId: supplier.id },
      proposedContent: { tags: allergens },
      reason: `Recorded from ${supplier.name}'s documentation.`,
      sources: supplierDoc(note, '2026-03-02'),
    });
    await approve(cr.id, kallista);
  }

  // official BOMs accepted by quality
  for (const recipe of Object.values(RECIPES)) {
    await proposeSourceAcceptance(morgra, {
      dataTypeId: types.officialBom,
      subject: item(recipe.name),
      reason: 'Matches the released MBPR.',
    });
  }

  // espresso listing approved; macaron listing left waiting for a quality reviewer
  const espressoListing = await proposeEdit(modron, {
    dataTypeId: types.ingredientListing,
    subject: item(RECIPES.espresso.name),
    proposedContent: { items: RECIPES.espresso.listing },
    reason: 'Listing for the new menu boards.',
  });
  await approve(espressoListing.id, morgra);

  await proposeEdit(modron, {
    dataTypeId: types.ingredientListing,
    subject: item(RECIPES.macaron.name),
    proposedContent: { items: RECIPES.macaron.listing },
    reason: 'Listing for the pastry case cards.',
  });

  // espresso menu allergens, then a re-verified material makes them stale
  const espressoAllergens = await proposeEdit(modron, {
    dataTypeId: types.menuAllergens,
    subject: item(RECIPES.espresso.name),
    proposedContent: { tags: RECIPES.espresso.allergens },
    reason: 'Allergen callouts for the menu.',
  });
  await approve(espressoAllergens.id, kallista);

  await proposeEdit(kallista, {
    dataTypeId: types.allergens,
    subject: item('Astral Espresso Beans'),
    proposedContent: { tags: [] },
    reason: 'Re-verified against the updated specification sheet.',
    sources: supplierDoc('Specification sheet rev. C', '2026-09-20'),
  });

  // shelf label for one size of the espresso
  const espressoSize = await db.finishedProduct.findFirst({
    where: { filledWithItemId: itemId(RECIPES.espresso.name) },
    orderBy: { name: 'asc' },
  });
  if (espressoSize) {
    const label = await proposeEdit(modron, {
      dataTypeId: types.shelfLabel,
      subject: { kind: 'finishedProduct', finishedProductId: espressoSize.id },
      proposedContent: {
        blocks: [
          { title: 'Freshly Brewed Astral Espresso', body: 'Pulled to order from beans roasted under a full moon.' },
          { title: 'Contains', body: 'Milk' },
        ],
      },
      reason: 'Shelf label for the new size.',
    });
    await approve(label.id, morgra);
  }

  // menu description (marketing reviews its own copy)
  await proposeEdit(modron, {
    dataTypeId: types.menuDescription,
    subject: item(RECIPES.espresso.name),
    proposedContent: {
      plain: 'A bold, starlit shot with steamed moon-grazed milk and a whisper of cane sugar.',
      html: 'A bold, starlit shot with steamed moon-grazed milk and a whisper of cane sugar.',
    },
    reason: 'Menu refresh.',
  });

  const artifacts = await db.canonArtifact.count();
  console.log(`  + ${artifacts.toString().padStart(4)} canonArtifact`);
};
