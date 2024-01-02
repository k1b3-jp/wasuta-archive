import { supabase } from '../supabaseClient';

// イベントを取得するためのオプションの型を定義します
interface GetEventsOptions {
  limit?: number;
  sortBy?: string;
  ascending?: boolean;
  filterBy?: string;
  filterValue?: any;
  byToday?: boolean;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

export async function getEvents(options?: GetEventsOptions) {
  let query = supabase.from('events').select(`*`);

  if (options?.tags && options.tags.length > 0) {
    query = query.select(`
      *,
      event_tags!inner(*,
        event_tag_names(name)
      )
    `);
  }

  // 条件があればクエリに適用します
  // if (options?.filterBy && options?.filterValue !== undefined) {
  //   query = query.ilike(options.filterBy, options.filterValue);
  // }

  if (options?.keyword) {
    query = query.ilike('event_name', `%${options?.keyword}%`);
  }

  // 日付範囲でフィルタリング
  if (options?.startDate) {
    query = query.gte('date', options.startDate);
  }
  if (options?.endDate) {
    query = query.lte('date', options.endDate);
  }

  // 今日までのイベントを取得する
  if (options?.byToday) {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 今日の終わりの時間に設定
    query = query.lte('date', today.toISOString());
  }

  // タグによるフィルター
  console.log(options?.tags);
  if (options?.tags && options.tags.length > 0) {
    query = query.in('event_tags.tag_id', options.tags);
  }

  // ソート順を適用します。デフォルトは開催日の昇順です。
  const sortBy = 'date';
  query = query.order(sortBy, { ascending: options?.ascending ?? false });

  // リミットが指定されていれば適用します
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data: events, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  console.log(events);

  return events;
}
