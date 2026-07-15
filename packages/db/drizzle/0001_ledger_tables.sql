CREATE TABLE "commitment" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"context" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "commitment_context_check" CHECK ("commitment"."context" in ('work','personal','joint'))
);
--> statement-breakpoint
CREATE TABLE "ledger_erasure_key" (
	"erasure_scope" text PRIMARY KEY NOT NULL,
	"wrapped_data_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_event" (
	"id" text PRIMARY KEY NOT NULL,
	"event_seq" bigint GENERATED ALWAYS AS IDENTITY (sequence name "ledger_event_event_seq_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"event_type" text NOT NULL,
	"actor" text NOT NULL,
	"context" text NOT NULL,
	"payload" jsonb NOT NULL,
	"caused_by" text,
	"compensates_event_id" text,
	"erasure_scope" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ledger_event_context_check" CHECK ("ledger_event"."context" in ('work','personal','joint'))
);
--> statement-breakpoint
CREATE INDEX "commitment_context_idx" ON "commitment" USING btree ("context");--> statement-breakpoint
CREATE INDEX "ledger_event_context_idx" ON "ledger_event" USING btree ("context");--> statement-breakpoint
CREATE INDEX "ledger_event_type_idx" ON "ledger_event" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "ledger_event_erasure_scope_idx" ON "ledger_event" USING btree ("erasure_scope");