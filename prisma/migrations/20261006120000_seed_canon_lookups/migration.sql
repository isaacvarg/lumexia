-- Seed the canon lookup tables (static records) on every instance.
--
-- Instances that were initialized before canon existed never run `npm run init` again,
-- so the rows the app references by static ID must arrive through a migration.
-- IDs are the deterministic staticRecordId(<file>, <camelCased name>) values that
-- scripts/initialization/data/canon*.ts produce, so init and this migration agree.
-- Generated from those data files; if they change, add a new migration the same way.

INSERT INTO "canon_artifact_statuses" ("id", "name", "description", "sequence", "bg_color", "text_color", "updated_at") VALUES
  ('d0a83a74-dd10-56ad-8c14-496ba58b568b', 'Pending', 'Created but has no accepted version yet.', 0, '#F8EAEC', '#333333', CURRENT_TIMESTAMP),
  ('661b4a35-6d78-558c-9164-5123b4d18c57', 'Current', 'Accepted and up to date.', 1, '#E3E9DD', '#333333', CURRENT_TIMESTAMP),
  ('17eaaf2d-f48e-5507-9700-287adcfce1a7', 'Stale', 'An upstream artifact changed; needs confirmation or a change request.', 2, '#FFD7BA', '#333333', CURRENT_TIMESTAMP),
  ('849071d6-8501-5717-8a53-a34444eb2022', 'Unreviewed Change', 'The linked Lumexia source changed and has not been accepted.', 3, '#FFE5A0', '#333333', CURRENT_TIMESTAMP),
  ('632048c6-d611-5dbf-9664-f28741f96c6d', 'Expired', 'The evidence is past its re-verification date.', 4, '#FEC5BB', '#333333', CURRENT_TIMESTAMP),
  ('f0a1fa4e-0a2a-5e65-a3d9-73c6b683db69', 'Conflict', 'Upstream values disagree and need a reviewer''s decision.', 5, '#F4ACB7', '#333333', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO "canon_capabilities" ("id", "name", "description", "updated_at") VALUES
  ('6d792feb-b451-5cf2-bd50-f546b14fa08e', 'Edit', 'Can open change requests.', CURRENT_TIMESTAMP),
  ('83fe7473-a90a-52c2-b728-b8ffa11bc421', 'Review', 'Can approve or reject change requests.', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO "canon_change_request_kinds" ("id", "name", "description", "updated_at") VALUES
  ('377c7d95-f40d-5a53-9f00-bfb2f0342620', 'Edit', 'Proposes new content.', CURRENT_TIMESTAMP),
  ('7456470b-ae39-56fc-b9e8-69225b5e4d8c', 'Stale Confirmation', 'Upstream changed; confirms the current content is still valid.', CURRENT_TIMESTAMP),
  ('6055411c-3828-5d49-a4ac-0aba70147db4', 'Source Acceptance', 'Accepts a change detected in a linked type''s Lumexia source.', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO "canon_change_request_statuses" ("id", "name", "description", "sequence", "bg_color", "text_color", "updated_at") VALUES
  ('3deb5d7d-1bb0-5cc3-ada5-a6857c13d772', 'Under Review', 'Waiting for reviewer decisions.', 0, '#FFE5A0', '#333333', CURRENT_TIMESTAMP),
  ('926ca564-f20b-5696-846d-4616d9fd411a', 'Approved', 'Approved and applied as a new version.', 1, '#E3E9DD', '#333333', CURRENT_TIMESTAMP),
  ('a7654aa4-2cd2-5d79-be39-df0d627802d0', 'Rejected', 'Rejected by a reviewer.', 2, '#FEC5BB', '#333333', CURRENT_TIMESTAMP),
  ('f7019c34-8eaa-57a9-8354-449aeaf9c6f9', 'Withdrawn', 'Withdrawn by the requester.', 3, '#D8E2DC', '#333333', CURRENT_TIMESTAMP),
  ('9ae6bfff-54ed-5510-a297-2b0b9583bdbe', 'Outdated', 'The artifact changed before this CR was resolved.', 4, '#F8EAEC', '#333333', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO "canon_dependency_kinds" ("id", "name", "description", "updated_at") VALUES
  ('a72420da-446e-506e-956e-4c0417aceb5e', 'Same Subject', 'Parent and child artifacts belong to the same item or finished product.', CURRENT_TIMESTAMP),
  ('292dd124-3274-56f6-b0e7-03393d2446c6', 'Active Bom', 'The child depends on the parent artifact of every material in its active MBPR BOM.', CURRENT_TIMESTAMP),
  ('70ef78f8-f416-568c-ba7a-c418e3b3af14', 'Suppliers', 'The child item depends on every item + supplier artifact for that item.', CURRENT_TIMESTAMP),
  ('b46e50ce-3e28-59a3-9a9b-0c15002dd9df', 'Filled Item', 'A finished product depends on the artifact of the item it is filled with.', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO "canon_event_types" ("id", "name", "description", "updated_at") VALUES
  ('a8d57605-4fa4-5714-b882-a39af0faaa15', 'Change Request Opened', NULL, CURRENT_TIMESTAMP),
  ('622f3220-8c82-55a1-a20f-3c53b2ace73a', 'Change Request Approved', NULL, CURRENT_TIMESTAMP),
  ('25c14048-dde3-5377-9652-f065360013f4', 'Change Request Rejected', NULL, CURRENT_TIMESTAMP),
  ('850ab298-56aa-5730-a84e-bf7c2b723bfe', 'Change Request Withdrawn', NULL, CURRENT_TIMESTAMP),
  ('9d747c7c-7fe1-5897-b2c7-c6dcc23eb14a', 'Change Request Outdated', 'The artifact changed before the CR was resolved.', CURRENT_TIMESTAMP),
  ('34c48338-6a71-5c15-94e3-4af8ed3fe0dc', 'Version Created', NULL, CURRENT_TIMESTAMP),
  ('6bac94ca-3695-53e9-9418-bbf130441f0a', 'Marked Stale', 'An upstream artifact got a new version.', CURRENT_TIMESTAMP),
  ('07072d42-8802-5312-9316-dda20221a3a0', 'Source Changed', 'A linked type''s source changed and awaits review.', CURRENT_TIMESTAMP),
  ('10b569f7-f539-50f6-9518-4f619a846e22', 'Reverification Expired', NULL, CURRENT_TIMESTAMP),
  ('7120e63a-f12a-5da8-9197-6238ecc83ffa', 'Conflict Raised', 'Upstream values disagree, e.g. two suppliers state different INCIs.', CURRENT_TIMESTAMP),
  ('b2db4094-afa5-5db6-ab27-98c4ec0f4750', 'Conflict Resolved', NULL, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO "canon_shapes" ("id", "name", "description", "updated_at") VALUES
  ('7a3f1540-f203-53fc-9153-00f67ba2c729', 'Text', 'A single line or paragraph of plain text.', CURRENT_TIMESTAMP),
  ('0f45a30b-92b7-529c-92ce-2e6139b8bd0b', 'Rich Text', 'Formatted text.', CURRENT_TIMESTAMP),
  ('8ee149b7-b234-50a7-a062-9b4d90c1b1c2', 'Boolean', 'Yes / no, e.g. Vegan.', CURRENT_TIMESTAMP),
  ('4d56ec45-d73a-5be9-bbcb-41d6583d817b', 'Ordered List', 'An ordered list of strings, e.g. an ingredient listing.', CURRENT_TIMESTAMP),
  ('e4cc02bf-1dea-54da-93cc-134d46384e0c', 'Tag Set', 'A set of tags chosen from a vocabulary in the shape config, e.g. website sprites.', CURRENT_TIMESTAMP),
  ('ec22c311-ac98-57ab-8a7b-45cf358b6d11', 'Block List', 'An ordered list of title + body blocks, e.g. website content blocks.', CURRENT_TIMESTAMP),
  ('222598a3-d7bd-5554-a6d0-c84205d7f3f9', 'Key Value', 'Property / value pairs, e.g. technical properties.', CURRENT_TIMESTAMP),
  ('d7b80173-dab4-57af-b1c2-5c4f886ffb62', 'Composition', 'Rows of INCI name, percentage and CAS number, e.g. a supplier blend composition.', CURRENT_TIMESTAMP),
  ('3f88f6c6-ff0b-53b0-abcd-4753c07acf22', 'Bill Of Materials', 'Rows of material, concentration and step, e.g. the active MBPR BOM.', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO "canon_source_types" ("id", "name", "description", "updated_at") VALUES
  ('94de199a-da7d-5e8e-a288-6643ff3a4db5', 'Supplier Document', 'SDS, TDS, COA, spec sheet or certificate from the supplier.', CURRENT_TIMESTAMP),
  ('afb5730f-87ec-563a-8dbe-6595a301a8da', 'Supplier Communication', 'Email or other correspondence with the supplier.', CURRENT_TIMESTAMP),
  ('3280a905-8e49-5204-9fad-89c8160c5d3f', 'Internal Test', 'A test or measurement performed internally.', CURRENT_TIMESTAMP),
  ('06b5c2d4-1420-590e-9417-f71463ba68ee', 'Regulatory Database', 'A regulatory or nomenclature database, e.g. INCI, Prop 65 list.', CURRENT_TIMESTAMP),
  ('f5a83e2f-0151-5aa8-b37e-ac31e475f061', 'Internal Judgment', 'A decision made internally without external evidence.', CURRENT_TIMESTAMP),
  ('50561c38-43a0-590e-9064-d4a50d9abc6e', 'Lumexia Record', 'Read from a Lumexia record by a linked type resolver.', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO "canon_subject_types" ("id", "name", "description", "updated_at") VALUES
  ('2387ccc6-f8de-50a9-abd1-a67e79808d86', 'Item', 'One artifact per item.', CURRENT_TIMESTAMP),
  ('18c7ebb8-76d3-5f2c-b732-7907a59d7b27', 'Finished Product', 'One artifact per finished product (size / package).', CURRENT_TIMESTAMP),
  ('d286a882-056c-5c5f-af44-c6d168dce892', 'Item Supplier', 'One artifact per item and supplier pair, for supplier-stated facts.', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
