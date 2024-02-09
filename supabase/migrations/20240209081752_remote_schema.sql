alter table "public"."event_tag_names" enable row level security;

alter table "public"."event_tags" enable row level security;

alter table "public"."event_youtube_links" enable row level security;

alter table "public"."events" enable row level security;

alter table "public"."youtube_links" enable row level security;

alter table "public"."youtube_tag_names" enable row level security;

alter table "public"."youtube_tags" enable row level security;

create policy "Enable ALL for authenticated users only"
on "public"."event_tag_names"
as permissive
for all
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."event_tag_names"
as permissive
for select
to public
using (true);


create policy "Enable ALL for authenticated users only"
on "public"."event_tags"
as permissive
for all
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."event_tags"
as permissive
for select
to public
using (true);


create policy "Enable ALL for authenticated users only"
on "public"."event_youtube_links"
as permissive
for all
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."event_youtube_links"
as permissive
for select
to public
using (true);


create policy "Enable ALL for authenticated users only"
on "public"."events"
as permissive
for all
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."events"
as permissive
for select
to public
using (true);


create policy "Enable ALL for authenticated users only"
on "public"."youtube_links"
as permissive
for all
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."youtube_links"
as permissive
for select
to public
using (true);


create policy "Enable ALL for authenticated users only"
on "public"."youtube_tag_names"
as permissive
for all
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."youtube_tag_names"
as permissive
for select
to public
using (true);


create policy "Enable ALL for authenticated users only"
on "public"."youtube_tags"
as permissive
for all
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."youtube_tags"
as permissive
for select
to public
using (true);



