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
}

export async function getEvents(options?: GetEventsOptions) {
  let query = supabase.from('events').select('*');

  // 条件があればクエリに適用します
  // if (options?.filterBy && options?.filterValue !== undefined) {
  //   query = query.ilike(options.filterBy, options.filterValue);
  // }

  if (options?.keyword) {
    query = query.ilike('event_name', `%${options?.keyword}%`);
  }

  // 今日までのイベントを取得する
  if (options?.byToday) {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 今日の終わりの時間に設定
    query = query.lte('date', today.toISOString());
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

  return events;
}
