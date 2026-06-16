export interface ItemData {
  name: string;
  uomKey: 'pounds' | 'kilogramss' | 'grams' | 'units';
  procurement: 'purchased' | 'produced';
}


export const DEMO_INGREDIENTS_ITEMS: ReadonlyArray<ItemData> = [
  { name: "Astral Espresso Beans", uomKey: "pounds", procurement: "purchased" },
  { name: "Brimstone Spice Blend", uomKey: "grams", procurement: "purchased" },
  { name: "Crushed Goodberry Syrup Extract", uomKey: "grams", procurement: "purchased" },
  { name: "Powdered Underdark Flour", uomKey: "pounds", procurement: "purchased" },
  { name: "Feywild Honey Crystals", uomKey: "grams", procurement: "purchased" },
  { name: "Moon-Grazed Whole Milk", uomKey: "pounds", procurement: "purchased" },
  { name: "Starlight Cane Sugar", uomKey: "pounds", procurement: "purchased" },
  { name: "Fire Elementalist Chili Flakes", uomKey: "grams", procurement: "purchased" },
  { name: "Chionthar Coarse Sea Salt", uomKey: "pounds", procurement: "purchased" },
  { name: "Chult Vanilla Pods", uomKey: "grams", procurement: "purchased" },
  { name: "Mimic Jam Fruit Base", uomKey: "pounds", procurement: "purchased" },
  { name: "Waterdeep Medium-Roast Coffee", uomKey: "pounds", procurement: "purchased" },
  { name: "Dried Flumph Meringue Powder", uomKey: "grams", procurement: "purchased" },
  { name: "Yggdrasil Sap Concentrate", uomKey: "grams", procurement: "purchased" },
  { name: "Pandemonium Peppermint Leaves", uomKey: "grams", procurement: "purchased" }
];


export const DEMO_CAFE_SUPPLIES_ITEMS: ReadonlyArray<ItemData> = [
  { name: "Smelt & Shard Ceramic Mugs", uomKey: "units", procurement: "purchased" },
  { name: "Portal-Insulated Takeout Cups", uomKey: "units", procurement: "purchased" },
  { name: "Anti-Spill Enchanted Cup Lids", uomKey: "units", procurement: "purchased" },
  { name: "Recycled Hemp Napkins", uomKey: "units", procurement: "purchased" },
  { name: "Birchwood Pastry Forks", uomKey: "units", procurement: "purchased" },
  { name: "Prestidigitation Cleaning Fluid", uomKey: "pounds", procurement: "purchased" },
  { name: "Brown Kraft Pastry Bags", uomKey: "units", procurement: "purchased" },
  { name: "Coarse Scouring Grime Pumice", uomKey: "pounds", procurement: "purchased" },
  { name: "Clockwork Countercloths", uomKey: "units", procurement: "purchased" },
  { name: "Wax-Lined Espresso Straws", uomKey: "units", procurement: "purchased" },
  { name: "Lower Ward Leather Aprons", uomKey: "units", procurement: "purchased" },
  { name: "Alchemical Degreaser Soap", uomKey: "pounds", procurement: "purchased" },
  { name: "Brass Table Menu Holders", uomKey: "units", procurement: "purchased" },
  { name: "Dragon-Scale Heat Mitts", uomKey: "units", procurement: "purchased" },
  { name: "Spell-Scrolled Receipt Rolls", uomKey: "units", procurement: "purchased" }
];

export const DEMO_CAT_SUPPLIES_ITEMS: ReadonlyArray<ItemData> = [
  { name: "Elemental Earth Odorless Litter", uomKey: "pounds", procurement: "purchased" },
  { name: "Catnip-Infused Goodberry Kibble", uomKey: "pounds", procurement: "purchased" },
  { name: "Dehydrated Astral Salmon Flakes", uomKey: "grams", procurement: "purchased" },
  { name: "Displacer Beast Neutralizing Spray", uomKey: "units", procurement: "purchased" },
  { name: "Sisal Rope Scratch Post Wraps", uomKey: "units", procurement: "purchased" },
  { name: "Velvet Pocket-Dimension Cat Beds", uomKey: "units", procurement: "purchased" },
  { name: "Clockwork Mouse Windup Toys", uomKey: "units", procurement: "purchased" },
  { name: "Flumph Plush Nip Toys", uomKey: "units", procurement: "purchased" },
  { name: "Blessed Flea-Be-Gone Powder", uomKey: "grams", procurement: "purchased" },
  { name: "Ceramic Heavy-Bottom Food Bowls", uomKey: "units", procurement: "purchased" },
  { name: "Stainless-Steel Grooming Combs", uomKey: "units", procurement: "purchased" },
  { name: "Chult Feather Wand Teasers", uomKey: "units", procurement: "purchased" },
  { name: "Hairball Dissolving Paste", uomKey: "grams", procurement: "purchased" },
  { name: "Portal-Shielded Waste Scoops", uomKey: "units", procurement: "purchased" },
  { name: "Calming Fey-Herb Aroma Mist", uomKey: "units", procurement: "purchased" }
];

export const DEMO_TABLETOP_ITEMS: ReadonlyArray<ItemData> = [
  { name: "Ticket to Ride: The Blood War", uomKey: "units", procurement: "purchased" },
  { name: "Lords of Waterdeep Board Game", uomKey: "units", procurement: "purchased" },
  { name: "The Great Modron March Puzzle", uomKey: "units", procurement: "purchased" },
  { name: "Betrayal at House on Baldur's Gate", uomKey: "units", procurement: "purchased" },
  { name: "Munchkin: Undermountain Card Game", uomKey: "units", procurement: "purchased" },
  { name: "Heavy Obsidian Polyhedral d20s", uomKey: "units", procurement: "purchased" },
  { name: "Acid-Resistant Matte Card Sleeves", uomKey: "units", procurement: "purchased" },
  { name: "Velvet Drawstring Dice Pouches", uomKey: "units", procurement: "purchased" },
  { name: "Sand-Timer of the Chronomancer", uomKey: "units", procurement: "purchased" },
  { name: "Wooden Meeple Replacement Packs", uomKey: "units", procurement: "purchased" },
  { name: "Spell-Slot Metal Tracking Tokens", uomKey: "units", procurement: "purchased" },
  { name: "Leather-Bound Modular Map Boards", uomKey: "units", procurement: "purchased" },
  { name: "Neoprene Planar Table Mats", uomKey: "units", procurement: "purchased" },
  { name: "Rules Lawyering Reference Manuals", uomKey: "units", procurement: "purchased" },
  { name: "Dice Tower of the High Mage", uomKey: "units", procurement: "purchased" }
];

export const DEMO_RECIPES_ITEMS: ReadonlyArray<ItemData> = [
  { name: "Freshly Brewed Astral Espresso", uomKey: "units", procurement: "produced" },
  { name: "Steaming Cup of Brimstone Chai", uomKey: "units", procurement: "produced" },
  { name: "Goodberry Matcha Latte", uomKey: "units", procurement: "produced" },
  { name: "The Mimic Macaron", uomKey: "units", procurement: "produced" },
  { name: "Flumph Meringue Kiss", uomKey: "units", procurement: "produced" },
  { name: "Beholder Jelly Donut", uomKey: "units", procurement: "produced" },
  { name: "Honey-Drizzled Feywild Scone", uomKey: "units", procurement: "produced" },
  { name: "Deep-Earth Brioche Bun", uomKey: "units", procurement: "produced" },
  { name: "Chionthar Salted Caramel Tart", uomKey: "units", procurement: "produced" },
  { name: "Chult Spiced Iced Tea", uomKey: "units", procurement: "produced" },
  { name: "Owlbear Claws Pastry", uomKey: "units", procurement: "produced" },
  { name: "Mind Flayer Mocha Blend", uomKey: "units", procurement: "produced" },
  { name: "Pixie Dust Shortbread Cookie", uomKey: "units", procurement: "produced" },
  { name: "Underdark Mushroom Quiche", uomKey: "units", procurement: "produced" },
  { name: "Githzerai Clear-Mind Herbal Tea", uomKey: "units", procurement: "produced" }
];

export const DEMO_MERCHANDISE_ITEMS: ReadonlyArray<ItemData> = [
  { name: "Portals & Paws Screenprinted Hoodie", uomKey: "units", procurement: "purchased" },
  { name: "Lady Pain Enamel Lapel Pin", uomKey: "units", procurement: "purchased" },
  { name: "Barnaby the Displacer Beast Sticker", uomKey: "units", procurement: "purchased" },
  { name: "Portals & Paws Canvas Tote Bag", uomKey: "units", procurement: "purchased" },
  { name: "Modron Square Loaf Plushie", uomKey: "units", procurement: "purchased" },
  { name: "Embroidered Faction Slouch Beanie", uomKey: "units", procurement: "purchased" },
  { name: "Portals & Paws Insulated Tumbler", uomKey: "units", procurement: "purchased" },
  { name: "Collectible Cafe Interior Art Print", uomKey: "units", procurement: "purchased" },
  { name: "Absorbent Sandstone Coaster Set", uomKey: "units", procurement: "purchased" },
  { name: "Woven Sigil Faction Iron-On Patch", uomKey: "units", procurement: "purchased" },
  { name: "Branded Tooled-Leather Bookmark", uomKey: "units", procurement: "purchased" },
  { name: "Portals & Paws Stylized Playing Cards", uomKey: "units", procurement: "purchased" },
  { name: "Stainless the Warforged Kitchen Magnet", uomKey: "units", procurement: "purchased" },
  { name: "Cozy Cache Logo Fitted T-Shirt", uomKey: "units", procurement: "purchased" },
  { name: "Branded Mahogany Dice Rolling Cup", uomKey: "units", procurement: "purchased" }
];

