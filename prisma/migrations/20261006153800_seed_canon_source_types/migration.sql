-- Add evidence source types for facts that come from law/regulation or scientific literature
-- rather than a supplier. Same deterministic IDs as scripts/initialization/data/canonSourceTypes.ts
-- (staticRecordId("canonSourceTypes", <camelCased name>)), so init and this migration agree.

INSERT INTO "canon_source_types" ("id", "name", "description", "updated_at") VALUES
  ('a70a30dc-99fe-52f0-bcc0-1a1f26b1e3e2', 'Regulatory Document', 'A law, regulation, standard or legal opinion, e.g. 21 CFR, an IFRA standard, counsel''s memo.', CURRENT_TIMESTAMP),
  ('d199792c-4139-5821-bde7-de9e77d03ec8', 'Scientific Reference', 'Published literature, a chemistry reference or a technical handbook.', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
