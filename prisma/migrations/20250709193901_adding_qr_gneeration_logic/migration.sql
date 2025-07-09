-- CreateTable
CREATE TABLE "event_qr_codes" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT,
    "qr_data" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_checkins" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "user_id" TEXT,
    "checked_in_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guest_count" INTEGER NOT NULL DEFAULT 0,
    "check_in_method" TEXT,
    "location_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_qr_codes_invitation_id_idx" ON "event_qr_codes"("invitation_id");

-- CreateIndex
CREATE INDEX "event_qr_codes_event_id_idx" ON "event_qr_codes"("event_id");

-- CreateIndex
CREATE INDEX "event_qr_codes_user_id_idx" ON "event_qr_codes"("user_id");

-- CreateIndex
CREATE INDEX "event_qr_codes_expires_at_idx" ON "event_qr_codes"("expires_at");

-- CreateIndex
CREATE INDEX "event_qr_codes_is_active_idx" ON "event_qr_codes"("is_active");

-- CreateIndex
CREATE INDEX "event_checkins_event_id_idx" ON "event_checkins"("event_id");

-- CreateIndex
CREATE INDEX "event_checkins_user_id_idx" ON "event_checkins"("user_id");

-- CreateIndex
CREATE INDEX "event_checkins_checked_in_at_idx" ON "event_checkins"("checked_in_at");

-- CreateIndex
CREATE INDEX "event_checkins_check_in_method_idx" ON "event_checkins"("check_in_method");

-- CreateIndex
CREATE UNIQUE INDEX "event_checkins_invitation_id_key" ON "event_checkins"("invitation_id");

-- AddForeignKey
ALTER TABLE "event_qr_codes" ADD CONSTRAINT "event_qr_codes_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "event_invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_qr_codes" ADD CONSTRAINT "event_qr_codes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_qr_codes" ADD CONSTRAINT "event_qr_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_checkins" ADD CONSTRAINT "event_checkins_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_checkins" ADD CONSTRAINT "event_checkins_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "event_invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_checkins" ADD CONSTRAINT "event_checkins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
