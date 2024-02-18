CREATE UNIQUE INDEX events_event_name_key ON public.events USING btree (event_name);

CREATE UNIQUE INDEX youtube_links_url_key ON public.youtube_links USING btree (url);

alter table "public"."events" add constraint "events_event_name_key" UNIQUE using index "events_event_name_key";

alter table "public"."youtube_links" add constraint "youtube_links_url_key" UNIQUE using index "youtube_links_url_key";


