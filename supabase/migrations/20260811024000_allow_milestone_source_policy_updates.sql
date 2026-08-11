-- Forward fix for databases that applied 20260811023000 before its narrow
-- milestone-source policy grant was added.
grant update on table public.milestone_sources to authenticated;
