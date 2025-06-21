-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(10,2),
    "currency" TEXT DEFAULT 'USD',
    "max_participants" INTEGER,
    "min_participants" INTEGER,
    "auto_approve" BOOLEAN NOT NULL DEFAULT true,
    "allow_guests" BOOLEAN NOT NULL DEFAULT false,
    "require_approval" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "tags" TEXT[],
    "age_restriction" TEXT,
    "dress_code" TEXT,
    "created_by" TEXT NOT NULL,
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_roles" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "can_invite_users" BOOLEAN NOT NULL DEFAULT false,
    "can_edit_event" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_locations" BOOLEAN NOT NULL DEFAULT false,
    "can_view_analytics" BOOLEAN NOT NULL DEFAULT false,
    "can_send_messages" BOOLEAN NOT NULL DEFAULT false,
    "assigned_by" TEXT,
    "role_notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_locations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "venue_type" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postal_code" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "online_url" TEXT,
    "online_platform" TEXT,
    "meeting_id" TEXT,
    "access_code" TEXT,
    "start_datetime" TIMESTAMP(3) NOT NULL,
    "end_datetime" TIMESTAMP(3) NOT NULL,
    "setup_time" TIMESTAMP(3),
    "cleanup_time" TIMESTAMP(3),
    "capacity" INTEGER,
    "is_accessible" BOOLEAN NOT NULL DEFAULT true,
    "parking_info" TEXT,
    "public_transport" TEXT,
    "special_instructions" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attachments" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "attachment_id" TEXT NOT NULL,
    "attachment_type" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_invitations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "invited_user_id" TEXT,
    "invited_email" TEXT,
    "invited_by" TEXT NOT NULL,
    "invitation_type" TEXT NOT NULL DEFAULT 'participant',
    "personal_message" TEXT,
    "max_guests" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "response_date" TIMESTAMP(3),
    "decline_reason" TEXT,
    "guest_count" INTEGER NOT NULL DEFAULT 0,
    "dietary_restrictions" TEXT,
    "special_requests" TEXT,
    "will_attend_all_locations" BOOLEAN,
    "attending_locations" TEXT[],
    "arrival_time" TIMESTAMP(3),
    "departure_time" TIMESTAMP(3),
    "is_plus_one" BOOLEAN NOT NULL DEFAULT false,
    "parent_invitation_id" TEXT,
    "reminder_sent_at" TIMESTAMP(3),
    "reminder_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_created_by_idx" ON "events"("created_by");

-- CreateIndex
CREATE INDEX "events_type_idx" ON "events"("type");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "events_category_idx" ON "events"("category");

-- CreateIndex
CREATE INDEX "events_start_date_idx" ON "events"("start_date");

-- CreateIndex
CREATE INDEX "events_is_public_idx" ON "events"("is_public");

-- CreateIndex
CREATE INDEX "event_roles_event_id_idx" ON "event_roles"("event_id");

-- CreateIndex
CREATE INDEX "event_roles_user_id_idx" ON "event_roles"("user_id");

-- CreateIndex
CREATE INDEX "event_roles_role_idx" ON "event_roles"("role");

-- CreateIndex
CREATE UNIQUE INDEX "event_roles_event_id_user_id_key" ON "event_roles"("event_id", "user_id");

-- CreateIndex
CREATE INDEX "event_locations_event_id_idx" ON "event_locations"("event_id");

-- CreateIndex
CREATE INDEX "event_locations_start_datetime_idx" ON "event_locations"("start_datetime");

-- CreateIndex
CREATE INDEX "event_locations_city_country_idx" ON "event_locations"("city", "country");

-- CreateIndex
CREATE INDEX "event_attachments_event_id_idx" ON "event_attachments"("event_id");

-- CreateIndex
CREATE INDEX "event_attachments_attachment_type_idx" ON "event_attachments"("attachment_type");

-- CreateIndex
CREATE UNIQUE INDEX "event_attachments_event_id_attachment_id_key" ON "event_attachments"("event_id", "attachment_id");

-- CreateIndex
CREATE INDEX "event_invitations_event_id_idx" ON "event_invitations"("event_id");

-- CreateIndex
CREATE INDEX "event_invitations_invited_user_id_idx" ON "event_invitations"("invited_user_id");

-- CreateIndex
CREATE INDEX "event_invitations_invited_by_idx" ON "event_invitations"("invited_by");

-- CreateIndex
CREATE INDEX "event_invitations_status_idx" ON "event_invitations"("status");

-- CreateIndex
CREATE INDEX "event_invitations_invited_email_idx" ON "event_invitations"("invited_email");

-- CreateIndex
CREATE UNIQUE INDEX "event_invitations_event_id_invited_user_id_key" ON "event_invitations"("event_id", "invited_user_id");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_roles" ADD CONSTRAINT "event_roles_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_roles" ADD CONSTRAINT "event_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_roles" ADD CONSTRAINT "event_roles_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_locations" ADD CONSTRAINT "event_locations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attachments" ADD CONSTRAINT "event_attachments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attachments" ADD CONSTRAINT "event_attachments_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invitations" ADD CONSTRAINT "event_invitations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invitations" ADD CONSTRAINT "event_invitations_invited_user_id_fkey" FOREIGN KEY ("invited_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invitations" ADD CONSTRAINT "event_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invitations" ADD CONSTRAINT "event_invitations_parent_invitation_id_fkey" FOREIGN KEY ("parent_invitation_id") REFERENCES "event_invitations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
