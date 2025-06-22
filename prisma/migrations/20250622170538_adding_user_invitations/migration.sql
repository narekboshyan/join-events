-- CreateTable
CREATE TABLE "user_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "connected_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "connection_type" TEXT DEFAULT 'friend',
    "notes" TEXT,
    "last_interaction" TIMESTAMP(3),
    "interaction_count" INTEGER NOT NULL DEFAULT 0,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "can_see_events" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile_visits" (
    "id" TEXT NOT NULL,
    "visitor_id" TEXT,
    "profile_user_id" TEXT NOT NULL,
    "visited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "referrer" TEXT,
    "session_id" TEXT,
    "page_section" TEXT,
    "duration" INTEGER,
    "interactions" INTEGER NOT NULL DEFAULT 0,
    "device_type" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,

    CONSTRAINT "user_profile_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_page_visits" (
    "id" TEXT NOT NULL,
    "visitor_id" TEXT,
    "event_id" TEXT NOT NULL,
    "visited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "referrer" TEXT,
    "session_id" TEXT,
    "page_section" TEXT,
    "duration" INTEGER,
    "interactions" INTEGER NOT NULL DEFAULT 0,
    "rsvp_action" TEXT,
    "invitation_id" TEXT,
    "utm_source" TEXT,
    "utm_campaign" TEXT,
    "utm_medium" TEXT,
    "device_type" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,

    CONSTRAINT "event_page_visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_connections_user_id_idx" ON "user_connections"("user_id");

-- CreateIndex
CREATE INDEX "user_connections_connected_id_idx" ON "user_connections"("connected_id");

-- CreateIndex
CREATE INDEX "user_connections_status_idx" ON "user_connections"("status");

-- CreateIndex
CREATE INDEX "user_connections_connection_type_idx" ON "user_connections"("connection_type");

-- CreateIndex
CREATE UNIQUE INDEX "user_connections_user_id_connected_id_key" ON "user_connections"("user_id", "connected_id");

-- CreateIndex
CREATE INDEX "user_profile_visits_visitor_id_idx" ON "user_profile_visits"("visitor_id");

-- CreateIndex
CREATE INDEX "user_profile_visits_profile_user_id_idx" ON "user_profile_visits"("profile_user_id");

-- CreateIndex
CREATE INDEX "user_profile_visits_visited_at_idx" ON "user_profile_visits"("visited_at");

-- CreateIndex
CREATE INDEX "user_profile_visits_ip_address_idx" ON "user_profile_visits"("ip_address");

-- CreateIndex
CREATE INDEX "user_profile_visits_is_anonymous_idx" ON "user_profile_visits"("is_anonymous");

-- CreateIndex
CREATE INDEX "user_profile_visits_session_id_idx" ON "user_profile_visits"("session_id");

-- CreateIndex
CREATE INDEX "user_profile_visits_profile_user_id_visitor_id_visited_at_idx" ON "user_profile_visits"("profile_user_id", "visitor_id", "visited_at");

-- CreateIndex
CREATE INDEX "event_page_visits_visitor_id_idx" ON "event_page_visits"("visitor_id");

-- CreateIndex
CREATE INDEX "event_page_visits_event_id_idx" ON "event_page_visits"("event_id");

-- CreateIndex
CREATE INDEX "event_page_visits_visited_at_idx" ON "event_page_visits"("visited_at");

-- CreateIndex
CREATE INDEX "event_page_visits_ip_address_idx" ON "event_page_visits"("ip_address");

-- CreateIndex
CREATE INDEX "event_page_visits_is_anonymous_idx" ON "event_page_visits"("is_anonymous");

-- CreateIndex
CREATE INDEX "event_page_visits_invitation_id_idx" ON "event_page_visits"("invitation_id");

-- CreateIndex
CREATE INDEX "event_page_visits_session_id_idx" ON "event_page_visits"("session_id");

-- CreateIndex
CREATE INDEX "event_page_visits_event_id_visitor_id_visited_at_idx" ON "event_page_visits"("event_id", "visitor_id", "visited_at");

-- AddForeignKey
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_connected_id_fkey" FOREIGN KEY ("connected_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile_visits" ADD CONSTRAINT "user_profile_visits_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile_visits" ADD CONSTRAINT "user_profile_visits_profile_user_id_fkey" FOREIGN KEY ("profile_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_page_visits" ADD CONSTRAINT "event_page_visits_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_page_visits" ADD CONSTRAINT "event_page_visits_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_page_visits" ADD CONSTRAINT "event_page_visits_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "event_invitations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
