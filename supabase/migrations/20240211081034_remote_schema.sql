drop policy "Enable update for authenticated users only" on "public"."event_tags";

drop policy "Enable update for authenticated users only" on "public"."event_youtube_links";

drop policy "Enable update for authenticated users only" on "public"."events";

drop policy "Enable update for authenticated users only" on "public"."youtube_links";

drop policy "Enable update for authenticated users only" on "public"."youtube_tags";

create policy "Enable update for authenticated users only"
on "public"."event_tags"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "Enable update for authenticated users only"
on "public"."event_youtube_links"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "Enable update for authenticated users only"
on "public"."events"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "Enable update for authenticated users only"
on "public"."youtube_links"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "Enable update for authenticated users only"
on "public"."youtube_tags"
as permissive
for update
to authenticated
using (true)
with check (true);



