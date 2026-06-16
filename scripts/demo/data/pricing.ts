// Data for the accounting / pricing layers: the café's payment wallet, pricing
// templates (finished products + auxiliaries), and flavor text for examination notes.

export interface PaymentMethodData {
  methodName: string;
  associatedName: string;
  paymentType: string; // 'credit' | 'debit' | 'cash' | 'transfer' | ...
  identifier: string;
  accountEndingIn?: string;
  expiry?: string;
  limit: number;
  bgColorA: string;
  bgColorB: string;
  circleColorA?: string;
  circleColorB?: string;
}

export const PAYMENT_METHODS: ReadonlyArray<PaymentMethodData> = [
  // paymentType MUST be one of the values PaymentMethodDisplay renders:
  // 'visa' | 'mastercard' | 'amex' (card), 'bankTransfer', or 'check' — anything else
  // renders nothing.
  {
    methodName: 'Gilded Coffer Charge Card', associatedName: 'Portals & Paws LLC', paymentType: 'amex',
    identifier: 'GILDED-COFFER', accountEndingIn: '0666', expiry: '11/28', limit: 25000,
    bgColorA: '#7c5e10', bgColorB: '#3d2f17', circleColorA: '#f6d365', circleColorB: '#c79a2e',
  },
  {
    methodName: 'Sigil Bank Draft', associatedName: 'Portals & Paws LLC', paymentType: 'bankTransfer',
    identifier: 'SIGIL-DRAFT', accountEndingIn: '1042', limit: 100000,
    bgColorA: '#1e3a5f', bgColorB: '#0f1f33', circleColorA: '#7fb2e5', circleColorB: '#3f6f9f',
  },
  {
    methodName: 'Counting-House Check', associatedName: 'Front of House', paymentType: 'check',
    identifier: 'PETTY-CASH', accountEndingIn: '0001', limit: 1500,
    bgColorA: '#14422f', bgColorB: '#0a2419', circleColorA: '#9fe0b8', circleColorB: '#4caf7d',
  },
  {
    methodName: 'Planar Trade Ledger', associatedName: 'Morgra Hearthbreaker', paymentType: 'bankTransfer',
    identifier: 'PLANAR-LEDGER', accountEndingIn: '7777', limit: 50000,
    bgColorA: '#3f2d56', bgColorB: '#231933', circleColorA: '#c9b3ed', circleColorB: '#8a6fc0',
  },
  {
    methodName: 'Lower Ward Debit Chit', associatedName: 'Portals & Paws LLC', paymentType: 'visa',
    identifier: 'LW-DEBIT', accountEndingIn: '3120', expiry: '04/27', limit: 8000,
    bgColorA: '#5c1a1a', bgColorB: '#2e0d0d', circleColorA: '#f0a3a3', circleColorB: '#c25b5b',
  },
];

// Pricing templates: a finished-product packaging spec plus its auxiliaries. The
// `auxiliaryTypeName` values are matched at seed time to real Cafe Supplies items by a
// loose keyword (the layer picks a packaging item whose name contains the keyword).
export interface PricingTemplateAuxiliarySpec {
  auxiliaryKeyword: string; // matched against a Cafe Supplies item name
  quantity: number;
  difficultyAdjustmentCost: number;
}

export interface PricingTemplateFinishedProductSpec {
  name: string;
  fillQuantity: number;
  declaredQuantity: number;
  freeShippingCost: number;
  difficultyAdjustmentCost: number;
  auxiliaries: PricingTemplateAuxiliarySpec[];
}

export interface PricingTemplateData {
  name: string;
  description: string;
  forItemTypeName: string; // matched to a demo itemType by name
  finishedProducts: PricingTemplateFinishedProductSpec[];
}

export const PRICING_TEMPLATES: ReadonlyArray<PricingTemplateData> = [
  {
    name: 'Hot Drink To-Go', description: 'Standard takeaway packaging for hot beverages.', forItemTypeName: 'Recipes',
    finishedProducts: [
      {
        name: '12oz To-Go Cup', fillQuantity: 0.75, declaredQuantity: 12, freeShippingCost: 0, difficultyAdjustmentCost: 0.15,
        auxiliaries: [
          { auxiliaryKeyword: 'Takeout Cups', quantity: 1, difficultyAdjustmentCost: 0.04 },
          { auxiliaryKeyword: 'Cup Lids', quantity: 1, difficultyAdjustmentCost: 0.02 },
          { auxiliaryKeyword: 'Straws', quantity: 1, difficultyAdjustmentCost: 0.01 },
        ],
      },
      {
        name: '16oz To-Go Cup', fillQuantity: 1.0, declaredQuantity: 16, freeShippingCost: 0, difficultyAdjustmentCost: 0.18,
        auxiliaries: [
          { auxiliaryKeyword: 'Takeout Cups', quantity: 1, difficultyAdjustmentCost: 0.05 },
          { auxiliaryKeyword: 'Cup Lids', quantity: 1, difficultyAdjustmentCost: 0.02 },
        ],
      },
    ],
  },
  {
    name: 'Bakery Box', description: 'Pastry boxing for the baked goods counter.', forItemTypeName: 'Recipes',
    finishedProducts: [
      {
        name: 'Single Pastry Bag', fillQuantity: 1, declaredQuantity: 1, freeShippingCost: 0, difficultyAdjustmentCost: 0.1,
        auxiliaries: [
          { auxiliaryKeyword: 'Pastry Bags', quantity: 1, difficultyAdjustmentCost: 0.03 },
          { auxiliaryKeyword: 'Napkins', quantity: 1, difficultyAdjustmentCost: 0.01 },
        ],
      },
    ],
  },
];

export const EXAMINATION_NOTES: ReadonlyArray<string> = [
  'Used the upcoming supplier price — the caravan already confirmed the increase.',
  'Margins are thin on the to-go cups; flagged for review before approving.',
  'Difficulty adjustment bumped — the fey honey scorches if rushed, slows the line.',
  'Container cost reconciled against the last Smelt & Shard invoice.',
  'Profit threshold cleared comfortably on every size. Recommend approval.',
  'Held for review — the produced cost per lb jumped after the flour reprice.',
  'Auxiliary lids were short last month; padded the difficulty cost slightly.',
];
