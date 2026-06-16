// Hand-authored recipes for every produced item. Each recipe maps a produced item
// (by exact name from data/items.ts) to its batch sizes and ordered steps. Bill-of-
// material lines live on the step where the ingredient is actually added, and only
// reference the 15 real ingredient items — sensibly matched to the product.
//
// `concentration` is percent of batch weight (the app computes a BPR line quantity as
// batchSize.quantity * concentration * 0.01). For beverages the unlisted remainder is
// brewed water, so drink concentrations are intentionally light.

export interface RecipeBomLine {
  ingredientName: string; // must match an ingredient item name in data/items.ts
  concentration: number; // percent of batch
}

export interface RecipeStep {
  phase: string;
  label: string;
  instructions: string[];
  equipmentTypeKeys: string[]; // must match EQUIPMENT_TYPES keys
  actionableTypeKeys: string[]; // must match refs.stepActionableTypes keys
  addendums?: { typeKey: 'warning' | 'info'; content: string }[];
  ingredients: RecipeBomLine[];
}

export interface Recipe {
  producedItemName: string; // must match a produced item name in data/items.ts
  versionLabel: string;
  estimatedTotalTime: number; // minutes
  batchSizes: number[]; // pounds
  steps: RecipeStep[];
}

export const RECIPES: ReadonlyArray<Recipe> = [
  {
    producedItemName: 'Freshly Brewed Astral Espresso',
    versionLabel: 'v2',
    estimatedTotalTime: 12,
    batchSizes: [10, 25],
    steps: [
      {
        phase: 'Brew', label: 'Pull the shots',
        instructions: ['Grind the astral beans fine and pull until the crema shimmers, ~25 seconds.'],
        equipmentTypeKeys: ['espressoMachine'], actionableTypeKeys: ['numericEntry', 'completeStep'],
        addendums: [{ typeKey: 'warning', content: 'Over-extracted shots will literally drift off the cup. Watch the timer.' }],
        ingredients: [{ ingredientName: 'Astral Espresso Beans', concentration: 18 }],
      },
      {
        phase: 'Finish', label: 'Combine and sweeten',
        instructions: ['Stretch the milk to a glossy microfoam, then fold in the sugar.'],
        equipmentTypeKeys: ['workTable'], actionableTypeKeys: ['booleanCheck', 'completeStep'],
        ingredients: [
          { ingredientName: 'Moon-Grazed Whole Milk', concentration: 78 },
          { ingredientName: 'Starlight Cane Sugar', concentration: 4 },
        ],
      },
    ],
  },
  {
    producedItemName: 'Steaming Cup of Brimstone Chai',
    versionLabel: 'v3',
    estimatedTotalTime: 18,
    batchSizes: [15, 40],
    steps: [
      {
        phase: 'Steep', label: 'Bloom the spice',
        instructions: ['Steep the brimstone blend and split vanilla in the kettle three minutes — no longer or it bites.'],
        equipmentTypeKeys: ['compoundingKettle'], actionableTypeKeys: ['numericEntry', 'booleanCheck'],
        addendums: [{ typeKey: 'warning', content: 'Wear the dragon-scale mitts. The steam off the brimstone is no joke.' }],
        ingredients: [
          { ingredientName: 'Brimstone Spice Blend', concentration: 8 },
          { ingredientName: 'Chult Vanilla Pods', concentration: 2 },
        ],
      },
      {
        phase: 'Finish', label: 'Cut with milk',
        instructions: ['Temper in the moon-grazed milk and dissolve the sugar off the heat.'],
        equipmentTypeKeys: ['compoundingKettle'], actionableTypeKeys: ['completeStep'],
        ingredients: [
          { ingredientName: 'Moon-Grazed Whole Milk', concentration: 80 },
          { ingredientName: 'Starlight Cane Sugar', concentration: 10 },
        ],
      },
    ],
  },
  {
    producedItemName: 'Goodberry Matcha Latte',
    versionLabel: 'v1',
    estimatedTotalTime: 10,
    batchSizes: [10, 25],
    steps: [
      {
        phase: 'Whisk', label: 'Smooth the base',
        instructions: ['Whisk the goodberry extract smooth before anything else, or it pebbles.'],
        equipmentTypeKeys: ['workTable'], actionableTypeKeys: ['booleanCheck', 'completeStep'],
        ingredients: [{ ingredientName: 'Crushed Goodberry Syrup Extract', concentration: 10 }],
      },
      {
        phase: 'Finish', label: 'Build the latte',
        instructions: ['Add milk, then balance with honey and a touch of sugar.'],
        equipmentTypeKeys: ['workTable'], actionableTypeKeys: ['numericEntry', 'completeStep'],
        ingredients: [
          { ingredientName: 'Moon-Grazed Whole Milk', concentration: 80 },
          { ingredientName: 'Feywild Honey Crystals', concentration: 5 },
          { ingredientName: 'Starlight Cane Sugar', concentration: 5 },
        ],
      },
    ],
  },
  {
    producedItemName: 'The Mimic Macaron',
    versionLabel: 'v4',
    estimatedTotalTime: 75,
    batchSizes: [12, 30],
    steps: [
      {
        phase: 'Mix', label: 'Make the shells',
        instructions: ['Sift flour and sugar, fold into whipped meringue powder to a lava ribbon.'],
        equipmentTypeKeys: ['standMixer', 'benchScale'], actionableTypeKeys: ['numericEntry', 'booleanCheck'],
        ingredients: [
          { ingredientName: 'Powdered Underdark Flour', concentration: 25 },
          { ingredientName: 'Starlight Cane Sugar', concentration: 30 },
          { ingredientName: 'Dried Flumph Meringue Powder', concentration: 20 },
          { ingredientName: 'Chult Vanilla Pods', concentration: 5 },
        ],
      },
      {
        phase: 'Bake', label: 'Rest and bake',
        instructions: ['Pipe, rest a full half hour until skinned, then bake until the feet rise.'],
        equipmentTypeKeys: ['convectionOven'], actionableTypeKeys: ['completeStep', 'photoEvidence'],
        addendums: [{ typeKey: 'info', content: 'The shells chatter for the first hour out of the oven. Sell them fresh.' }],
        ingredients: [],
      },
      {
        phase: 'Fill', label: 'Sandwich with jam',
        instructions: ['Pipe the mimic jam centers and sandwich. Tap the tin first — if it taps back, walk away.'],
        equipmentTypeKeys: ['workTable'], actionableTypeKeys: ['completeStep'],
        ingredients: [{ ingredientName: 'Mimic Jam Fruit Base', concentration: 20 }],
      },
    ],
  },
  {
    producedItemName: 'Flumph Meringue Kiss',
    versionLabel: 'v2',
    estimatedTotalTime: 90,
    batchSizes: [8, 20],
    steps: [
      {
        phase: 'Whip', label: 'Whip the meringue',
        instructions: ['Whip meringue powder and sugar to stiff, glossy peaks with the vanilla.'],
        equipmentTypeKeys: ['standMixer'], actionableTypeKeys: ['numericEntry', 'booleanCheck'],
        addendums: [{ typeKey: 'warning', content: 'Never run this on a humid day — you will get puddles, not kisses.' }],
        ingredients: [
          { ingredientName: 'Dried Flumph Meringue Powder', concentration: 45 },
          { ingredientName: 'Starlight Cane Sugar', concentration: 50 },
          { ingredientName: 'Chult Vanilla Pods', concentration: 5 },
        ],
      },
      {
        phase: 'Bake', label: 'Low-and-slow bake',
        instructions: ['Pipe kisses and dry-bake low until they lift cleanly off the mat.'],
        equipmentTypeKeys: ['convectionOven'], actionableTypeKeys: ['completeStep'],
        ingredients: [],
      },
    ],
  },
  {
    producedItemName: 'Beholder Jelly Donut',
    versionLabel: 'v3',
    estimatedTotalTime: 120,
    batchSizes: [15, 35],
    steps: [
      {
        phase: 'Mix', label: 'Mix and proof the dough',
        instructions: ['Mix the enriched dough, knead, then proof until doubled.'],
        equipmentTypeKeys: ['standMixer', 'proofingCabinet'], actionableTypeKeys: ['numericEntry', 'booleanCheck'],
        ingredients: [
          { ingredientName: 'Powdered Underdark Flour', concentration: 45 },
          { ingredientName: 'Starlight Cane Sugar', concentration: 15 },
          { ingredientName: 'Moon-Grazed Whole Milk', concentration: 20 },
          { ingredientName: 'Chionthar Coarse Sea Salt', concentration: 2 },
        ],
      },
      {
        phase: 'Fry', label: 'Fry the rings',
        instructions: ['Fry to golden, drain, and cool before filling.'],
        equipmentTypeKeys: ['workTable'], actionableTypeKeys: ['completeStep', 'photoEvidence'],
        ingredients: [],
      },
      {
        phase: 'Fill', label: 'Pipe the eye',
        instructions: ['Pipe one big jam "eye" into the center; add the icing pupil last so it does not melt.'],
        equipmentTypeKeys: ['workTable'], actionableTypeKeys: ['completeStep'],
        ingredients: [{ ingredientName: 'Mimic Jam Fruit Base', concentration: 18 }],
      },
    ],
  },
  {
    producedItemName: 'Honey-Drizzled Feywild Scone',
    versionLabel: 'v2',
    estimatedTotalTime: 45,
    batchSizes: [12, 30],
    steps: [
      {
        phase: 'Mix', label: 'Cut the dough',
        instructions: ['Cut cold butter into the flour, add milk and a pinch of salt; do not overwork.'],
        equipmentTypeKeys: ['workTable', 'benchScale'], actionableTypeKeys: ['numericEntry', 'booleanCheck'],
        ingredients: [
          { ingredientName: 'Powdered Underdark Flour', concentration: 50 },
          { ingredientName: 'Moon-Grazed Whole Milk', concentration: 25 },
          { ingredientName: 'Starlight Cane Sugar', concentration: 8 },
          { ingredientName: 'Chionthar Coarse Sea Salt', concentration: 2 },
        ],
      },
      {
        phase: 'Bake', label: 'Bake the scones',
        instructions: ['Bake until golden and just set in the middle.'],
        equipmentTypeKeys: ['convectionOven'], actionableTypeKeys: ['completeStep'],
        ingredients: [],
      },
      {
        phase: 'Finish', label: 'Drizzle the honey',
        instructions: ['Drizzle the fey honey while warm so it soaks in.'],
        equipmentTypeKeys: ['workTable'], actionableTypeKeys: ['completeStep'],
        ingredients: [{ ingredientName: 'Feywild Honey Crystals', concentration: 15 }],
      },
    ],
  },
  {
    producedItemName: 'Deep-Earth Brioche Bun',
    versionLabel: 'v3',
    estimatedTotalTime: 150,
    batchSizes: [15, 40],
    steps: [
      {
        phase: 'Mix', label: 'Develop the dough',
        instructions: ['Mix to a strong gluten window; the Underdark flour bakes dense, so proof longer.'],
        equipmentTypeKeys: ['standMixer'], actionableTypeKeys: ['numericEntry', 'booleanCheck'],
        ingredients: [
          { ingredientName: 'Powdered Underdark Flour', concentration: 50 },
          { ingredientName: 'Moon-Grazed Whole Milk', concentration: 25 },
          { ingredientName: 'Starlight Cane Sugar', concentration: 12 },
          { ingredientName: 'Feywild Honey Crystals', concentration: 10 },
          { ingredientName: 'Chionthar Coarse Sea Salt', concentration: 3 },
        ],
      },
      {
        phase: 'Proof', label: 'Proof and bake',
        instructions: ['Shape, proof in the cabinet until pillowy, then bake to a deep shine.'],
        equipmentTypeKeys: ['proofingCabinet', 'convectionOven'], actionableTypeKeys: ['completeStep', 'photoEvidence'],
        ingredients: [],
      },
    ],
  },
  {
    producedItemName: 'Chionthar Salted Caramel Tart',
    versionLabel: 'v2',
    estimatedTotalTime: 100,
    batchSizes: [12, 30],
    steps: [
      {
        phase: 'Bake', label: 'Blind-bake the shells',
        instructions: ['Press the flour-sugar shells and blind-bake until pale gold.'],
        equipmentTypeKeys: ['convectionOven', 'benchScale'], actionableTypeKeys: ['numericEntry', 'completeStep'],
        ingredients: [
          { ingredientName: 'Powdered Underdark Flour', concentration: 35 },
          { ingredientName: 'Starlight Cane Sugar', concentration: 35 },
          { ingredientName: 'Chult Vanilla Pods', concentration: 5 },
        ],
      },
      {
        phase: 'Fill', label: 'Cook the caramel',
        instructions: ['Cook the milk caramel to soft-ball, pour into shells, set.'],
        equipmentTypeKeys: ['compoundingKettle'], actionableTypeKeys: ['booleanCheck', 'completeStep'],
        ingredients: [{ ingredientName: 'Moon-Grazed Whole Milk', concentration: 20 }],
      },
      {
        phase: 'Finish', label: 'Finishing salt',
        instructions: ['Flaky sea salt on top right before service, never sooner, or it dissolves.'],
        equipmentTypeKeys: ['workTable'], actionableTypeKeys: ['completeStep'],
        ingredients: [{ ingredientName: 'Chionthar Coarse Sea Salt', concentration: 5 }],
      },
    ],
  },
  {
    producedItemName: 'Chult Spiced Iced Tea',
    versionLabel: 'v1',
    estimatedTotalTime: 30,
    batchSizes: [20, 50],
    steps: [
      {
        phase: 'Steep', label: 'Steep the spice tea',
        instructions: ['Steep peppermint and vanilla hot, then sweeten with sap and sugar.'],
        equipmentTypeKeys: ['teaUrn'], actionableTypeKeys: ['numericEntry', 'booleanCheck'],
        ingredients: [
          { ingredientName: 'Pandemonium Peppermint Leaves', concentration: 6 },
          { ingredientName: 'Chult Vanilla Pods', concentration: 4 },
          { ingredientName: 'Yggdrasil Sap Concentrate', concentration: 2 },
          { ingredientName: 'Starlight Cane Sugar', concentration: 10 },
        ],
      },
      {
        phase: 'Chill', label: 'Crash chill',
        instructions: ['Crash chill in the blast chiller and hold cold for service.'],
        equipmentTypeKeys: ['blastChiller'], actionableTypeKeys: ['completeStep'],
        ingredients: [],
      },
    ],
  },
  {
    producedItemName: 'Owlbear Claws Pastry',
    versionLabel: 'v2',
    estimatedTotalTime: 110,
    batchSizes: [12, 30],
    steps: [
      {
        phase: 'Mix', label: 'Laminate the dough',
        instructions: ['Mix, then laminate the dough for the claw layers.'],
        equipmentTypeKeys: ['standMixer'], actionableTypeKeys: ['numericEntry', 'booleanCheck'],
        ingredients: [
          { ingredientName: 'Powdered Underdark Flour', concentration: 48 },
          { ingredientName: 'Starlight Cane Sugar', concentration: 20 },
          { ingredientName: 'Moon-Grazed Whole Milk', concentration: 18 },
          { ingredientName: 'Chult Vanilla Pods', concentration: 4 },
        ],
      },
      {
        phase: 'Bake', label: 'Shape and bake',
        instructions: ['Cut the claws, bake until flaky and deep gold.'],
        equipmentTypeKeys: ['convectionOven'], actionableTypeKeys: ['completeStep', 'photoEvidence'],
        ingredients: [],
      },
      {
        phase: 'Finish', label: 'Honey glaze',
        instructions: ['Brush with the fey honey glaze while warm.'],
        equipmentTypeKeys: ['workTable'], actionableTypeKeys: ['completeStep'],
        ingredients: [{ ingredientName: 'Feywild Honey Crystals', concentration: 10 }],
      },
    ],
  },
  {
    producedItemName: 'Mind Flayer Mocha Blend',
    versionLabel: 'v3',
    estimatedTotalTime: 14,
    batchSizes: [10, 25],
    steps: [
      {
        phase: 'Brew', label: 'Pull and bloom',
        instructions: ['Pull the espresso, bloom the medium roast, and whisper in the chili and brimstone.'],
        equipmentTypeKeys: ['espressoMachine'], actionableTypeKeys: ['numericEntry', 'booleanCheck'],
        addendums: [{ typeKey: 'warning', content: 'A WHISPER of chili. One flake too many and it stops being a mocha.' }],
        ingredients: [
          { ingredientName: 'Waterdeep Medium-Roast Coffee', concentration: 12 },
          { ingredientName: 'Astral Espresso Beans', concentration: 6 },
          { ingredientName: 'Fire Elementalist Chili Flakes', concentration: 1 },
          { ingredientName: 'Brimstone Spice Blend', concentration: 3 },
        ],
      },
      {
        phase: 'Finish', label: 'Build and swirl',
        instructions: ['Add milk and sugar; swirl the foam "brain" on top — that is the whole gimmick.'],
        equipmentTypeKeys: ['workTable'], actionableTypeKeys: ['completeStep', 'photoEvidence'],
        ingredients: [
          { ingredientName: 'Moon-Grazed Whole Milk', concentration: 70 },
          { ingredientName: 'Starlight Cane Sugar', concentration: 8 },
        ],
      },
    ],
  },
  {
    producedItemName: 'Pixie Dust Shortbread Cookie',
    versionLabel: 'v2',
    estimatedTotalTime: 60,
    batchSizes: [12, 30],
    steps: [
      {
        phase: 'Mix', label: 'Cream the shortbread',
        instructions: ['Cream to a soft dough; chill before cutting.'],
        equipmentTypeKeys: ['standMixer', 'benchScale'], actionableTypeKeys: ['numericEntry', 'completeStep'],
        ingredients: [
          { ingredientName: 'Powdered Underdark Flour', concentration: 50 },
          { ingredientName: 'Starlight Cane Sugar', concentration: 28 },
          { ingredientName: 'Chult Vanilla Pods', concentration: 4 },
          { ingredientName: 'Chionthar Coarse Sea Salt', concentration: 2 },
        ],
      },
      {
        phase: 'Bake', label: 'Bake and dust',
        instructions: ['Bake pale, then dust with the shimmering honey-sugar while warm.'],
        equipmentTypeKeys: ['convectionOven'], actionableTypeKeys: ['completeStep'],
        addendums: [{ typeKey: 'info', content: 'The edible shimmer gets EVERYWHERE. You have been warned.' }],
        ingredients: [{ ingredientName: 'Feywild Honey Crystals', concentration: 8 }],
      },
    ],
  },
  {
    producedItemName: 'Underdark Mushroom Quiche',
    versionLabel: 'v2',
    estimatedTotalTime: 95,
    batchSizes: [12, 30],
    steps: [
      {
        phase: 'Bake', label: 'Blind-bake the crust',
        instructions: ['Press and blind-bake the savory Underdark crust.'],
        equipmentTypeKeys: ['convectionOven', 'benchScale'], actionableTypeKeys: ['numericEntry', 'completeStep'],
        ingredients: [
          { ingredientName: 'Powdered Underdark Flour', concentration: 40 },
          { ingredientName: 'Chionthar Coarse Sea Salt', concentration: 5 },
        ],
      },
      {
        phase: 'Fill', label: 'Custard and bake',
        instructions: ['Whisk the milk custard with the spice, fill, and bake until just set.'],
        equipmentTypeKeys: ['workTable', 'convectionOven'], actionableTypeKeys: ['booleanCheck', 'completeStep'],
        addendums: [{ typeKey: 'info', content: 'Label it clearly — it is the one savory item and the sweet-tooth crowd grabs it by mistake.' }],
        ingredients: [
          { ingredientName: 'Moon-Grazed Whole Milk', concentration: 45 },
          { ingredientName: 'Fire Elementalist Chili Flakes', concentration: 2 },
          { ingredientName: 'Brimstone Spice Blend', concentration: 3 },
        ],
      },
    ],
  },
  {
    producedItemName: 'Githzerai Clear-Mind Herbal Tea',
    versionLabel: 'v1',
    estimatedTotalTime: 20,
    batchSizes: [20, 50],
    steps: [
      {
        phase: 'Steep', label: 'Low-and-slow steep',
        instructions: ['Steep the peppermint low and slow so it soothes instead of buzzes; caffeine-free.'],
        equipmentTypeKeys: ['teaUrn'], actionableTypeKeys: ['numericEntry', 'booleanCheck'],
        ingredients: [
          { ingredientName: 'Pandemonium Peppermint Leaves', concentration: 8 },
          { ingredientName: 'Yggdrasil Sap Concentrate', concentration: 3 },
        ],
      },
      {
        phase: 'Finish', label: 'Sweeten and serve',
        instructions: ['Sweeten gently with fey honey and hold warm for the calm corner.'],
        equipmentTypeKeys: ['workTable'], actionableTypeKeys: ['completeStep'],
        ingredients: [{ ingredientName: 'Feywild Honey Crystals', concentration: 5 }],
      },
    ],
  },
];
