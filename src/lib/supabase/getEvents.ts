import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { supabase } from "../supabaseClient";

// イベントを取得するためのオプションの型を定義します
interface GetEventsOptions {
  limit?: number;
  sortBy?: string;
  ascending?: boolean;
  byToday?: boolean;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  eventId?: number;
  start?: number;
  end?: number;
  pagination?: boolean;
}

export async function getEvents(options?: GetEventsOptions) {
  let query = supabase.from("events").select("*") as PostgrestFilterBuilder<
    any,
    any,
    any[],
    "events",
    unknown
  >;

  if (options?.tags && options.tags.length > 0) {
    query = query.select(`
      *,
      event_tags!inner(*,
        event_tag_names(name)
      )
    `) as PostgrestFilterBuilder<any, any, any[], "events", unknown>;
  }

  // イベントIDでフィルタリング
  if (options?.eventId) {
    query = query.match({ event_id: options.eventId });
  }

  // キーワードでフィルタリング
  if (options?.keyword) {
    query = query.ilike("event_name", `%${options?.keyword}%`);
  }

  // 日付範囲でフィルタリング
  if (options?.startDate) {
    query = query.gte("date", options.startDate);
  }
  if (options?.endDate) {
    query = query.lte("date", options.endDate);
  }

  // 今日までのイベントを取得する
  if (options?.byToday) {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 今日の終わりの時間に設定
    query = query.lte("date", today.toISOString());
  }

  // タグによるフィルター
  if (options?.tags && options.tags.length > 0) {
    query = query.in("event_tags.tag_id", options.tags);
  }

  // リミットが指定されていれば適用します
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  // ページネーションのためのオプションを適用します
  const start = options?.start || 0;
  const end = options?.end || 9;
  if (options?.pagination) {
    query = query.range(start, end);
  }

  // ソート順を適用します。デフォルトは開催日の昇順です。
  const sortBy = "date";
  query = query.order(sortBy, { ascending: options?.ascending ?? false });

  const { data: events, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return events;
}
