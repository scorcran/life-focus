-- Custom SQL migration file, put your code below! --
-- AD-4: ledger_event is insert-only. A BEFORE UPDATE OR DELETE trigger raises,
-- blocking mutation for ALL roles including the table owner (a bare
-- REVOKE UPDATE/DELETE does not constrain an owner).

CREATE OR REPLACE FUNCTION ledger_reject_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	RAISE EXCEPTION 'ledger_event is append-only (AD-4): % is not permitted', TG_OP
		USING ERRCODE = 'restrict_violation';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER ledger_event_reject_mutation
	BEFORE UPDATE OR DELETE ON "ledger_event"
	FOR EACH ROW
	EXECUTE FUNCTION ledger_reject_mutation();
--> statement-breakpoint
-- TRUNCATE is a statement-level mutation vector that row-level UPDATE/DELETE
-- triggers never fire for — without this it would silently wipe the whole
-- append-only log (AD-4 bypass).
CREATE TRIGGER ledger_event_reject_truncate
	BEFORE TRUNCATE ON "ledger_event"
	FOR EACH STATEMENT
	EXECUTE FUNCTION ledger_reject_mutation();
