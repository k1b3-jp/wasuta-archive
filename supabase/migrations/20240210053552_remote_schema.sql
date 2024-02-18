drop policy "Enable ALL for authenticated users only" on "public"."event_tag_names";

drop policy "Enable ALL for authenticated users only" on "public"."event_tags";

drop policy "Enable ALL for authenticated users only" on "public"."event_youtube_links";

drop policy "Enable ALL for authenticated users only" on "public"."events";

drop policy "Enable ALL for authenticated users only" on "public"."youtube_links";

drop policy "Enable ALL for authenticated users only" on "public"."youtube_tag_names";

drop policy "Enable ALL for authenticated users only" on "public"."youtube_tags";

create policy "Enable delete for authenticated users only"
on "public"."event_tags"
as permissive
for delete
to authenticated
using (true);


create policy "Enable insert for authenticated users only"
on "public"."event_tags"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable update for authenticated users only"
on "public"."event_tags"
as permissive
for update
to authenticated
with check (true);


create policy "Enable delete for authenticated users only"
on "public"."event_youtube_links"
as permissive
for delete
to authenticated
using (true);


create policy "Enable insert for authenticated users only"
on "public"."event_youtube_links"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable update for authenticated users only"
on "public"."event_youtube_links"
as permissive
for update
to authenticated
with check (true);


create policy "Enable delete for authenticated users only"
on "public"."events"
as permissive
for delete
to authenticated
using (true);


create policy "Enable insert for authenticated users only"
on "public"."events"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable update for authenticated users only"
on "public"."events"
as permissive
for update
to authenticated
with check (true);


create policy "Enable delete for authenticated users only"
on "public"."youtube_links"
as permissive
for delete
to authenticated
using (true);


create policy "Enable insert for authenticated users only"
on "public"."youtube_links"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable update for authenticated users only"
on "public"."youtube_links"
as permissive
for update
to authenticated
with check (true);


create policy "Enable delete for authenticated users only"
on "public"."youtube_tags"
as permissive
for delete
to authenticated
using (true);


create policy "Enable insert for authenticated users only"
on "public"."youtube_tags"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable update for authenticated users only"
on "public"."youtube_tags"
as permissive
for update
to authenticated
with check (true);



