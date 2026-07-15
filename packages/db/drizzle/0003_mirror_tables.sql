CREATE TABLE "calendar_event_mirror" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"context" text NOT NULL,
	"external_id" text NOT NULL,
	"summary" text,
	"starts_at" text NOT NULL,
	"ends_at" text NOT NULL,
	"all_day" boolean DEFAULT false NOT NULL,
	"status" text NOT NULL,
	"recurring_event_id" text,
	"updated_at" text,
	CONSTRAINT "calendar_event_mirror_external_uq" UNIQUE("source_id","external_id"),
	CONSTRAINT "calendar_event_mirror_context_check" CHECK ("calendar_event_mirror"."context" in ('work','personal'))
);
--> statement-breakpoint
CREATE TABLE "calendar_source" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"account" text NOT NULL,
	"context" text NOT NULL,
	"google_calendar_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"access_token_cipher" text,
	"refresh_token_cipher" text,
	"access_token_expires_at" timestamp with time zone,
	"sync_token" text,
	"last_synced_at" timestamp with time zone,
	"last_sync_status" text,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calendar_source_identity_uq" UNIQUE("provider","account","context"),
	CONSTRAINT "calendar_source_context_check" CHECK ("calendar_source"."context" in ('work','personal'))
);
--> statement-breakpoint
ALTER TABLE "calendar_event_mirror" ADD CONSTRAINT "calendar_event_mirror_source_id_calendar_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."calendar_source"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calendar_event_mirror_source_idx" ON "calendar_event_mirror" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "calendar_event_mirror_context_idx" ON "calendar_event_mirror" USING btree ("context");--> statement-breakpoint
CREATE INDEX "calendar_source_context_idx" ON "calendar_source" USING btree ("context");--> statement-breakpoint
CREATE INDEX "calendar_source_status_idx" ON "calendar_source" USING btree ("status");