import type { FactKind, ValueSchema } from "./types";

// The starter fact catalog, upserted as approved keys (see ensureSeedCatalog in catalog.ts). Seeding only
// adds missing keys and document-type links; edits people make in Settings are never overwritten.
// documentTypes are ItemFileType abbreviations; types this instance doesn't have are skipped.
// required lists the document types an extraction is incomplete without this key.

export type SeedDefinition = {
  key: string;
  label: string;
  kind: FactKind;
  valueSchema?: ValueSchema;
  unitFamily?: string;
  safetyRelevant?: boolean;
  documentTypes: string[];
  required?: string[];
  description?: string;
};

const ALL = ["SDS", "TDS", "COA", "IFRA", "SPEC"];
const SPECS = ["SDS", "TDS", "SPEC"];
const text: ValueSchema = { type: "text" };
const number: ValueSchema = { type: "number" };
const date: ValueSchema = { type: "date" };
const chemical = { name: "chemical", type: "text", description: "Chemical name, never a trade name" } as const;
const cas = { name: "cas", type: "cas" } as const;

const claim = (key: string, label: string, description?: string): SeedDefinition => ({
  key,
  label,
  kind: "claim",
  safetyRelevant: false,
  documentTypes: ALL,
  description,
});

export const seedCatalog: SeedDefinition[] = [
  // Document
  { key: "product_name", label: "Product name", kind: "scalar", valueSchema: text, safetyRelevant: false, documentTypes: ALL, required: ["SDS", "COA", "TDS", "IFRA"] },
  { key: "trade_name", label: "Trade name", kind: "scalar", valueSchema: text, safetyRelevant: false, documentTypes: ALL },
  { key: "product_code", label: "Product code", kind: "scalar", valueSchema: text, safetyRelevant: false, documentTypes: ALL },
  { key: "supplier_name", label: "Supplier", kind: "scalar", valueSchema: text, safetyRelevant: false, documentTypes: ALL },
  { key: "sheet_date", label: "Sheet date", kind: "scalar", valueSchema: date, safetyRelevant: false, documentTypes: ALL, required: ["SDS"], description: "The sheet's own revision or issue date, not the upload date" },
  { key: "revision_label", label: "Revision", kind: "scalar", valueSchema: text, safetyRelevant: false, documentTypes: ALL },

  // Identity
  { key: "inci_name", label: "INCI name", kind: "scalar", valueSchema: text, documentTypes: ALL, required: ["TDS", "SPEC"], description: "The material's own INCI name; repeat for several" },
  { key: "cas_number", label: "CAS number", kind: "scalar", valueSchema: { type: "cas" }, documentTypes: ALL, description: "The material's own CAS; component CAS numbers go in composition" },
  { key: "ec_number", label: "EC number", kind: "scalar", valueSchema: text, documentTypes: ALL },
  {
    key: "composition",
    label: "Composition",
    kind: "row",
    valueSchema: {
      columns: [
        { ...chemical, required: true },
        cas,
        { name: "ec_number", type: "text" },
        { name: "concentration", type: "text", description: "As printed; a range stays a range" },
        { name: "concentration_min", type: "number" },
        { name: "concentration_max", type: "number" },
        { name: "classifications", type: "list", description: "The component's own hazard classifications" },
      ],
      normalize: { min: "concentration_min", max: "concentration_max" },
      defaultUnit: "%",
    },
    unitFamily: "concentration",
    documentTypes: SPECS,
  },
  { key: "material_origin", label: "Origin of material", kind: "enum", valueSchema: { options: ["plant", "animal", "synthetic", "mineral", "mixed"] }, safetyRelevant: false, documentTypes: ALL },

  // Physical
  { key: "physical_state", label: "Physical state", kind: "enum", valueSchema: { options: ["liquid", "solid", "powder", "gas", "paste"] }, safetyRelevant: false, documentTypes: SPECS },
  { key: "appearance", label: "Appearance", kind: "scalar", valueSchema: text, safetyRelevant: false, documentTypes: [...SPECS, "COA"] },
  { key: "odor", label: "Odor", kind: "scalar", valueSchema: text, safetyRelevant: false, documentTypes: [...SPECS, "COA"] },
  { key: "flashpoint", label: "Flash point", kind: "scalar", valueSchema: number, unitFamily: "temperature", documentTypes: SPECS, description: "Put the method (closed cup…) in the value's qualifier" },
  { key: "specific_gravity", label: "Specific gravity", kind: "scalar", valueSchema: number, safetyRelevant: false, documentTypes: [...SPECS, "COA"] },
  { key: "density", label: "Density", kind: "scalar", valueSchema: number, unitFamily: "density", safetyRelevant: false, documentTypes: [...SPECS, "COA"] },
  { key: "refractive_index", label: "Refractive index", kind: "scalar", valueSchema: number, safetyRelevant: false, documentTypes: [...SPECS, "COA"] },
  { key: "boiling_point", label: "Boiling point", kind: "scalar", valueSchema: number, unitFamily: "temperature", safetyRelevant: false, documentTypes: SPECS },
  { key: "melting_point", label: "Melting point", kind: "scalar", valueSchema: number, unitFamily: "temperature", safetyRelevant: false, documentTypes: SPECS },
  { key: "ph", label: "pH", kind: "scalar", valueSchema: number, safetyRelevant: false, documentTypes: [...SPECS, "COA"] },
  { key: "solubility", label: "Solubility", kind: "scalar", valueSchema: text, safetyRelevant: false, documentTypes: SPECS },

  // Classification (SDS section 2 is the supplier's formal classification and wins over other sections)
  { key: "signal_word", label: "Signal word", kind: "enum", valueSchema: { options: ["danger", "warning", "none"] }, documentTypes: ["SDS"], required: ["SDS"] },
  {
    key: "ghs_classification",
    label: "GHS classification",
    kind: "row",
    valueSchema: {
      columns: [
        { name: "hazard_class", type: "text", required: true },
        { name: "category", type: "text" },
        { name: "h_code", type: "text" },
      ],
    },
    documentTypes: ["SDS"],
    description: "As stated in section 2. A hazard you can't name from the sheet is flagged in notes, never invented",
  },
  { key: "hazard_statement", label: "Hazard statement", kind: "row", valueSchema: { columns: [{ name: "code", type: "text", required: true }, { name: "text", type: "text" }] }, documentTypes: ["SDS"] },
  { key: "precautionary_statement", label: "Precautionary statement", kind: "row", valueSchema: { columns: [{ name: "code", type: "text", required: true }, { name: "text", type: "text" }] }, safetyRelevant: false, documentTypes: ["SDS"] },
  { key: "pictogram", label: "Pictogram", kind: "enum", valueSchema: { options: ["GHS01", "GHS02", "GHS03", "GHS04", "GHS05", "GHS06", "GHS07", "GHS08", "GHS09"] }, documentTypes: ["SDS"] },
  { key: "m_factor", label: "M factor", kind: "row", valueSchema: { columns: [{ name: "category", type: "enum", options: ["acute_1", "chronic_1"], required: true }, { name: "value", type: "number", required: true }] }, documentTypes: ["SDS"] },

  // Toxicology
  { key: "acute_toxicity_status", label: "Acute toxicity", kind: "enum", valueSchema: { options: ["classified", "none", "unknown"] }, documentTypes: ["SDS"], required: ["SDS"], description: "unknown when in doubt; none and unknown are never interchangeable" },
  {
    key: "acute_toxicity",
    label: "Acute toxicity values",
    kind: "row",
    valueSchema: {
      columns: [
        { ...chemical, description: "Empty for material-level values" },
        { name: "route", type: "enum", options: ["oral", "dermal", "inhalation"], required: true },
        { name: "value", type: "number", required: true },
        { name: "unit", type: "text", required: true },
        { name: "basis", type: "text", description: "e.g. LD50 rat; GHS Table 3.1.2 converted ATE (Category 4)" },
        { name: "origin", type: "enum", options: ["measured", "converted"], required: true, description: "Measured always wins over converted" },
      ],
    },
    documentTypes: ["SDS"],
  },
  {
    key: "exposure_limit",
    label: "Exposure limit",
    kind: "row",
    valueSchema: { columns: [chemical, cas, { name: "basis", type: "text", required: true, description: "OSHA PEL, ACGIH TLV, a state, manufacturer AEL…" }, { name: "limit", type: "text", required: true }] },
    documentTypes: ["SDS"],
  },

  // Regulatory
  { key: "state_right_to_know", label: "State right-to-know", kind: "row", valueSchema: { columns: [chemical, cas, { name: "states", type: "list", required: true, description: "USPS codes" }] }, documentTypes: ["SDS"] },
  { key: "sara_311_312", label: "SARA 311/312", kind: "row", valueSchema: { columns: [chemical, cas, { name: "hazard_category", type: "text", required: true }] }, documentTypes: ["SDS"] },
  {
    key: "prop65",
    label: "California Prop 65",
    kind: "row",
    valueSchema: { columns: [chemical, cas, { name: "exposure", type: "enum", options: ["carcinogen", "reproductive_toxicant", "both"], required: true }] },
    documentTypes: ALL,
    description: "Contaminants count even if not in the composition",
  },
  {
    key: "tsca_basis",
    label: "TSCA basis",
    kind: "row",
    valueSchema: { columns: [chemical, cas, { name: "basis", type: "enum", options: ["exempt", "polymer_exemption", "low_volume_exemption", "active", "inactive"], required: true }] },
    documentTypes: ["SDS"],
    description: "Only specific bases; a blanket 'listed on TSCA' is the tsca_listed claim",
  },
  claim("tsca_listed", "Listed on TSCA", "A blanket statement that the material is TSCA listed"),
  { key: "reach_status", label: "REACH status", kind: "scalar", valueSchema: text, documentTypes: ALL },
  {
    key: "allergen",
    label: "Allergen",
    kind: "row",
    valueSchema: {
      columns: [
        { ...chemical, required: true },
        cas,
        { name: "concentration", type: "text", description: "As printed" },
        { name: "concentration_value", type: "number" },
        { name: "regulation", type: "text", description: "e.g. EU 26, EU 82" },
      ],
      normalize: { min: "concentration_value" },
      defaultUnit: "%",
    },
    unitFamily: "concentration",
    documentTypes: ["SDS", "IFRA", "TDS", "SPEC"],
  },
  { key: "ifra_amendment", label: "IFRA amendment", kind: "scalar", valueSchema: text, documentTypes: ["IFRA"], required: ["IFRA"] },
  {
    key: "ifra_limit",
    label: "IFRA category limit",
    kind: "row",
    valueSchema: { columns: [{ name: "category", type: "text", required: true }, { name: "max_concentration", type: "number", required: true }] , normalize: { min: "max_concentration" }, defaultUnit: "%" },
    unitFamily: "concentration",
    documentTypes: ["IFRA"],
  },

  // Transport and ecology
  { key: "un_number", label: "UN number", kind: "scalar", valueSchema: text, documentTypes: ["SDS"] },
  {
    key: "transport",
    label: "Transport",
    kind: "row",
    valueSchema: {
      columns: [
        { name: "mode", type: "text", required: true, description: "DOT, IATA, IMDG, ADR…" },
        { name: "un_number", type: "text" },
        { name: "proper_shipping_name", type: "text" },
        { name: "hazard_class", type: "text" },
        { name: "packing_group", type: "text" },
        { name: "special_precautions", type: "text" },
      ],
    },
    documentTypes: ["SDS"],
  },
  {
    key: "ecological",
    label: "Ecological information",
    kind: "row",
    valueSchema: {
      columns: [
        { name: "topic", type: "enum", options: ["ecotoxicity", "persistence_degradability", "bioaccumulation", "soil_mobility"], required: true },
        { name: "statement", type: "text", required: true },
      ],
    },
    documentTypes: ["SDS"],
  },

  // Sections whose emptiness matters: present and empty is not the same as not captured
  { key: "section_composition", label: "Composition section", kind: "section", documentTypes: ["SDS"], required: ["SDS"] },
  { key: "section_exposure_controls", label: "Exposure controls section", kind: "section", documentTypes: ["SDS"], required: ["SDS"] },
  { key: "section_toxicology", label: "Toxicology section", kind: "section", documentTypes: ["SDS"], required: ["SDS"] },
  { key: "section_ecological", label: "Ecological section", kind: "section", documentTypes: ["SDS"], required: ["SDS"] },
  { key: "section_transport", label: "Transport section", kind: "section", documentTypes: ["SDS"], required: ["SDS"] },
  { key: "section_regulatory", label: "Regulatory section", kind: "section", documentTypes: ["SDS"], required: ["SDS"] },

  // Origin and handling
  { key: "country_of_origin", label: "Country of origin", kind: "scalar", valueSchema: text, safetyRelevant: false, documentTypes: ALL },
  { key: "manufacturer", label: "Manufacturer", kind: "scalar", valueSchema: text, safetyRelevant: false, documentTypes: ALL },
  { key: "manufacturing_site", label: "Manufacturing site", kind: "scalar", valueSchema: text, safetyRelevant: false, documentTypes: ALL },
  { key: "shelf_life", label: "Shelf life", kind: "scalar", valueSchema: text, safetyRelevant: false, documentTypes: ALL },
  { key: "storage_conditions", label: "Storage conditions", kind: "scalar", valueSchema: text, safetyRelevant: false, documentTypes: ALL },
  { key: "grade", label: "Grade", kind: "scalar", valueSchema: text, safetyRelevant: false, documentTypes: ALL },

  // Claims: not_stated is not negated; a missing statement never supports a claim
  claim("vegan", "Vegan"),
  claim("vegetarian", "Vegetarian"),
  claim("cruelty_free", "Cruelty-free"),
  claim("animal_derived", "Animal-derived"),
  claim("non_gmo", "Non-GMO"),
  claim("organic_certified", "Organic certified"),
  claim("natural", "Natural"),
  claim("gluten_free", "Gluten-free"),
  claim("allergen_free", "Allergen-free"),
  claim("phthalate_free", "Phthalate-free"),
  claim("paraben_free", "Paraben-free"),
  claim("sulfate_free", "Sulfate-free"),
  claim("cmr_free", "Free of CMR substances"),
  claim("halal", "Halal"),
  claim("kosher", "Kosher"),

  // COA (lot-specific)
  { key: "lot_number", label: "Lot number", kind: "scalar", valueSchema: text, safetyRelevant: false, documentTypes: ["COA"], required: ["COA"] },
  { key: "manufacture_date", label: "Manufacture date", kind: "scalar", valueSchema: date, safetyRelevant: false, documentTypes: ["COA"] },
  { key: "expiry_date", label: "Expiry / retest date", kind: "scalar", valueSchema: date, safetyRelevant: false, documentTypes: ["COA"] },
  {
    key: "test_result",
    label: "Test result",
    kind: "row",
    valueSchema: {
      columns: [
        { name: "test", type: "text", required: true },
        { name: "specification", type: "text" },
        { name: "result", type: "text", required: true },
        { name: "unit", type: "text" },
        { name: "method", type: "text" },
        { name: "outcome", type: "enum", options: ["pass", "fail", "not_applicable"] },
      ],
    },
    safetyRelevant: false,
    documentTypes: ["COA"],
    required: ["COA"],
  },
  { key: "overall_result", label: "Overall result", kind: "enum", valueSchema: { options: ["pass", "fail"] }, safetyRelevant: false, documentTypes: ["COA"] },
];
