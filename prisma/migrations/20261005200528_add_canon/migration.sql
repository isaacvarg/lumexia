-- CreateTable
CREATE TABLE "canon_artifact_events" (
    "id" TEXT NOT NULL,
    "artifact_id" TEXT NOT NULL,
    "event_type_id" TEXT NOT NULL,
    "user_id" TEXT,
    "version_id" TEXT,
    "change_request_id" TEXT,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canon_artifact_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_artifact_statuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "text_color" TEXT NOT NULL DEFAULT '#333333',
    "bg_color" TEXT NOT NULL DEFAULT '#E3E9DD',
    "sequence" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_artifact_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_artifact_versions" (
    "id" TEXT NOT NULL,
    "artifact_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "change_request_id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "source_marker" TEXT,
    "source_date" TIMESTAMP(3),
    "reverify_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canon_artifact_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_artifacts" (
    "id" TEXT NOT NULL,
    "data_type_id" TEXT NOT NULL,
    "subject_key" TEXT NOT NULL,
    "item_id" TEXT,
    "finished_product_id" TEXT,
    "supplier_id" TEXT,
    "status_id" TEXT NOT NULL,
    "current_version_id" TEXT,
    "observed_marker" TEXT,
    "observed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_capabilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_change_request_kinds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_change_request_kinds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_change_request_reviews" (
    "id" TEXT NOT NULL,
    "change_request_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_change_request_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_change_request_sources" (
    "id" TEXT NOT NULL,
    "change_request_id" TEXT NOT NULL,
    "source_type_id" TEXT NOT NULL,
    "file_id" TEXT,
    "url" TEXT,
    "note" TEXT,
    "source_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_change_request_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_change_request_statuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "text_color" TEXT NOT NULL DEFAULT '#333333',
    "bg_color" TEXT NOT NULL DEFAULT '#E3E9DD',
    "sequence" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_change_request_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_change_requests" (
    "id" TEXT NOT NULL,
    "reference_code" SERIAL NOT NULL,
    "artifact_id" TEXT NOT NULL,
    "kind_id" TEXT NOT NULL,
    "status_id" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "base_version_id" TEXT,
    "proposed_content" JSONB,
    "proposed_marker" TEXT,
    "reason" TEXT NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_data_type_dependencies" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "kind_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_data_type_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_data_type_item_types" (
    "id" TEXT NOT NULL,
    "data_type_id" TEXT NOT NULL,
    "item_type_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_data_type_item_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_data_type_team_permissions" (
    "id" TEXT NOT NULL,
    "data_type_id" TEXT NOT NULL,
    "capability_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_data_type_team_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_data_type_user_permissions" (
    "id" TEXT NOT NULL,
    "data_type_id" TEXT NOT NULL,
    "capability_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_data_type_user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_data_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "shape_id" TEXT NOT NULL,
    "subject_type_id" TEXT NOT NULL,
    "shape_config" JSONB,
    "resolver_key" TEXT,
    "external_key" TEXT,
    "required_approvals" INTEGER NOT NULL DEFAULT 1,
    "requires_different_reviewer" BOOLEAN NOT NULL DEFAULT false,
    "requires_evidence" BOOLEAN NOT NULL DEFAULT false,
    "reverify_after_days" INTEGER,
    "procurement_type_id" TEXT,
    "record_status_id" TEXT NOT NULL,
    "canvas_x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "canvas_y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_data_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_dependency_kinds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_dependency_kinds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_event_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_event_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_shapes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_shapes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_source_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_source_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_subject_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_subject_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_team_members" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_version_lineage" (
    "id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "upstream_version_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canon_version_lineage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "canon_artifact_events_artifact_id_created_at_idx" ON "canon_artifact_events"("artifact_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "canon_artifact_statuses_name_key" ON "canon_artifact_statuses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "canon_artifact_statuses_sequence_key" ON "canon_artifact_statuses"("sequence");

-- CreateIndex
CREATE UNIQUE INDEX "canon_artifact_versions_change_request_id_key" ON "canon_artifact_versions"("change_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "canon_artifact_versions_artifact_id_version_number_key" ON "canon_artifact_versions"("artifact_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "canon_artifacts_current_version_id_key" ON "canon_artifacts"("current_version_id");

-- CreateIndex
CREATE INDEX "canon_artifacts_item_id_idx" ON "canon_artifacts"("item_id");

-- CreateIndex
CREATE INDEX "canon_artifacts_finished_product_id_idx" ON "canon_artifacts"("finished_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "canon_artifacts_data_type_id_subject_key_key" ON "canon_artifacts"("data_type_id", "subject_key");

-- CreateIndex
CREATE UNIQUE INDEX "canon_capabilities_name_key" ON "canon_capabilities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "canon_change_request_kinds_name_key" ON "canon_change_request_kinds"("name");

-- CreateIndex
CREATE UNIQUE INDEX "canon_change_request_reviews_change_request_id_reviewer_id_key" ON "canon_change_request_reviews"("change_request_id", "reviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "canon_change_request_statuses_name_key" ON "canon_change_request_statuses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "canon_change_request_statuses_sequence_key" ON "canon_change_request_statuses"("sequence");

-- CreateIndex
CREATE UNIQUE INDEX "canon_change_requests_reference_code_key" ON "canon_change_requests"("reference_code");

-- CreateIndex
CREATE INDEX "canon_change_requests_artifact_id_idx" ON "canon_change_requests"("artifact_id");

-- CreateIndex
CREATE UNIQUE INDEX "canon_data_type_dependencies_parent_id_child_id_key" ON "canon_data_type_dependencies"("parent_id", "child_id");

-- CreateIndex
CREATE UNIQUE INDEX "canon_data_type_item_types_data_type_id_item_type_id_key" ON "canon_data_type_item_types"("data_type_id", "item_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "canon_data_type_team_permissions_data_type_id_capability_id_key" ON "canon_data_type_team_permissions"("data_type_id", "capability_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "canon_data_type_user_permissions_data_type_id_capability_id_key" ON "canon_data_type_user_permissions"("data_type_id", "capability_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "canon_data_types_name_key" ON "canon_data_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "canon_dependency_kinds_name_key" ON "canon_dependency_kinds"("name");

-- CreateIndex
CREATE UNIQUE INDEX "canon_event_types_name_key" ON "canon_event_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "canon_shapes_name_key" ON "canon_shapes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "canon_source_types_name_key" ON "canon_source_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "canon_subject_types_name_key" ON "canon_subject_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "canon_team_members_team_id_user_id_key" ON "canon_team_members"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "canon_teams_name_key" ON "canon_teams"("name");

-- CreateIndex
CREATE INDEX "canon_version_lineage_upstream_version_id_idx" ON "canon_version_lineage"("upstream_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "canon_version_lineage_version_id_upstream_version_id_key" ON "canon_version_lineage"("version_id", "upstream_version_id");

-- AddForeignKey
ALTER TABLE "canon_artifact_events" ADD CONSTRAINT "canon_artifact_events_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "canon_artifacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_artifact_events" ADD CONSTRAINT "canon_artifact_events_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "canon_event_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_artifact_events" ADD CONSTRAINT "canon_artifact_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_artifact_events" ADD CONSTRAINT "canon_artifact_events_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "canon_artifact_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_artifact_events" ADD CONSTRAINT "canon_artifact_events_change_request_id_fkey" FOREIGN KEY ("change_request_id") REFERENCES "canon_change_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_artifact_versions" ADD CONSTRAINT "canon_artifact_versions_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "canon_artifacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_artifact_versions" ADD CONSTRAINT "canon_artifact_versions_change_request_id_fkey" FOREIGN KEY ("change_request_id") REFERENCES "canon_change_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_artifacts" ADD CONSTRAINT "canon_artifacts_data_type_id_fkey" FOREIGN KEY ("data_type_id") REFERENCES "canon_data_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_artifacts" ADD CONSTRAINT "canon_artifacts_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_artifacts" ADD CONSTRAINT "canon_artifacts_finished_product_id_fkey" FOREIGN KEY ("finished_product_id") REFERENCES "finished_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_artifacts" ADD CONSTRAINT "canon_artifacts_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_artifacts" ADD CONSTRAINT "canon_artifacts_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "canon_artifact_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_artifacts" ADD CONSTRAINT "canon_artifacts_current_version_id_fkey" FOREIGN KEY ("current_version_id") REFERENCES "canon_artifact_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_change_request_reviews" ADD CONSTRAINT "canon_change_request_reviews_change_request_id_fkey" FOREIGN KEY ("change_request_id") REFERENCES "canon_change_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_change_request_reviews" ADD CONSTRAINT "canon_change_request_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_change_request_sources" ADD CONSTRAINT "canon_change_request_sources_change_request_id_fkey" FOREIGN KEY ("change_request_id") REFERENCES "canon_change_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_change_request_sources" ADD CONSTRAINT "canon_change_request_sources_source_type_id_fkey" FOREIGN KEY ("source_type_id") REFERENCES "canon_source_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_change_request_sources" ADD CONSTRAINT "canon_change_request_sources_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_change_requests" ADD CONSTRAINT "canon_change_requests_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "canon_artifacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_change_requests" ADD CONSTRAINT "canon_change_requests_kind_id_fkey" FOREIGN KEY ("kind_id") REFERENCES "canon_change_request_kinds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_change_requests" ADD CONSTRAINT "canon_change_requests_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "canon_change_request_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_change_requests" ADD CONSTRAINT "canon_change_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_data_type_dependencies" ADD CONSTRAINT "canon_data_type_dependencies_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "canon_data_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_data_type_dependencies" ADD CONSTRAINT "canon_data_type_dependencies_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "canon_data_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_data_type_dependencies" ADD CONSTRAINT "canon_data_type_dependencies_kind_id_fkey" FOREIGN KEY ("kind_id") REFERENCES "canon_dependency_kinds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_data_type_item_types" ADD CONSTRAINT "canon_data_type_item_types_data_type_id_fkey" FOREIGN KEY ("data_type_id") REFERENCES "canon_data_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_data_type_item_types" ADD CONSTRAINT "canon_data_type_item_types_item_type_id_fkey" FOREIGN KEY ("item_type_id") REFERENCES "item_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_data_type_team_permissions" ADD CONSTRAINT "canon_data_type_team_permissions_data_type_id_fkey" FOREIGN KEY ("data_type_id") REFERENCES "canon_data_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_data_type_team_permissions" ADD CONSTRAINT "canon_data_type_team_permissions_capability_id_fkey" FOREIGN KEY ("capability_id") REFERENCES "canon_capabilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_data_type_team_permissions" ADD CONSTRAINT "canon_data_type_team_permissions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "canon_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_data_type_user_permissions" ADD CONSTRAINT "canon_data_type_user_permissions_data_type_id_fkey" FOREIGN KEY ("data_type_id") REFERENCES "canon_data_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_data_type_user_permissions" ADD CONSTRAINT "canon_data_type_user_permissions_capability_id_fkey" FOREIGN KEY ("capability_id") REFERENCES "canon_capabilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_data_type_user_permissions" ADD CONSTRAINT "canon_data_type_user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_data_types" ADD CONSTRAINT "canon_data_types_shape_id_fkey" FOREIGN KEY ("shape_id") REFERENCES "canon_shapes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_data_types" ADD CONSTRAINT "canon_data_types_subject_type_id_fkey" FOREIGN KEY ("subject_type_id") REFERENCES "canon_subject_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_data_types" ADD CONSTRAINT "canon_data_types_procurement_type_id_fkey" FOREIGN KEY ("procurement_type_id") REFERENCES "procurement_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_data_types" ADD CONSTRAINT "canon_data_types_record_status_id_fkey" FOREIGN KEY ("record_status_id") REFERENCES "record_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_team_members" ADD CONSTRAINT "canon_team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "canon_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_team_members" ADD CONSTRAINT "canon_team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_version_lineage" ADD CONSTRAINT "canon_version_lineage_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "canon_artifact_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_version_lineage" ADD CONSTRAINT "canon_version_lineage_upstream_version_id_fkey" FOREIGN KEY ("upstream_version_id") REFERENCES "canon_artifact_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
