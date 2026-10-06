-- Generated COAs (uploaded under item/coa/) were filed under a generic "Regulatory" file type.
-- Move them to the COA file type so document requirements can find them, creating that type if needed.
-- The "Regulatory" type itself is left alone since people may have filed other documents under it.

INSERT INTO "item_file_types" ("id", "name", "abbreviaton", "description", "bg_color", "text_color", "updated_at")
SELECT gen_random_uuid()::text, 'Certificate of Analysis', 'COA', 'PDF of the certificate of analysis', '#f0c6c6', '#24273a', CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "item_file_types"
    WHERE lower("abbreviaton") = 'coa' OR lower("name") = 'certificate of analysis'
  )
  AND EXISTS (
    SELECT 1 FROM "item_files" itf JOIN "files" f ON f."id" = itf."file_id"
    WHERE f."object_name" LIKE 'item/coa/%'
  );

UPDATE "item_files" itf
SET "file_type_id" = (
  SELECT t."id" FROM "item_file_types" t
  WHERE lower(t."abbreviaton") = 'coa' OR lower(t."name") = 'certificate of analysis'
  ORDER BY t."created_at"
  LIMIT 1
)
FROM "files" f
WHERE f."id" = itf."file_id"
  AND f."object_name" LIKE 'item/coa/%';
