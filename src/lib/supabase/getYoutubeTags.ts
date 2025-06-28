import { supabase } from "../supabaseClient";

// キャッシュの型定義
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// キャッシュストレージ
const cache = new Map<string, CacheItem<any>>();

// キャッシュのTTL（ミリ秒）- デフォルトは5分
const DEFAULT_TTL = 5 * 60 * 1000;

// キャッシュのヘルパー関数
const getCacheKey = (youtubeLinkId: number | null) => {
  return youtubeLinkId ? `youtube_tags_${youtubeLinkId}` : "all_youtube_tags";
};

const isExpired = (item: CacheItem<any>): boolean => {
  return Date.now() - item.timestamp > item.ttl;
};

const getFromCache = <T>(key: string): T | null => {
  const item = cache.get(key);
  if (!item || isExpired(item)) {
    cache.delete(key);
    return null;
  }
  return item.data;
};

const setCache = <T>(key: string, data: T, ttl: number = DEFAULT_TTL): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

export const getYoutubeTags = async (youtubeLinkId: number | null = null) => {
  const cacheKey = getCacheKey(youtubeLinkId);

  // キャッシュから取得を試行
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for ${cacheKey}`);
    return cachedData;
  }

  console.log(`Cache miss for ${cacheKey}, fetching from database`);

  if (youtubeLinkId) {
    // youtube_link_idが指定されている場合、そのYouTubeリンクに紐づくタグを取得
    const { data: youtubeTags, error } = await supabase
      .from("youtube_tags")
      .select(
        `
        tag_id,
        youtube_tag_names!inner(name)
      `
      )
      .eq("youtube_link_id", youtubeLinkId);

    if (error) {
      console.error("Error fetching tags for youtube_link_id:", error);
      return [];
    }

    const result =
      youtubeTags?.map((tag: any) => ({
        id: tag.tag_id,
        label: tag.youtube_tag_names.name,
      })) || [];

    // 特定のyoutubeLinkIdのキャッシュは短めのTTL（2分）
    setCache(cacheKey, result, 2 * 60 * 1000);
    return result;
  } else {
    // youtube_link_idが指定されていない場合、すべてのYouTubeタグを取得
    const { data: tags, error } = await supabase
      .from("youtube_tag_names")
      .select("tag_id, name");

    if (error) {
      console.error("Error fetching all YouTube tags:", error);
      return [];
    }

    const result =
      tags?.map((tag) => ({
        id: tag.tag_id,
        label: tag.name,
      })) || [];

    // 全タグのキャッシュは長めのTTL（10分）
    setCache(cacheKey, result, 10 * 60 * 1000);
    return result;
  }
};

// キャッシュをクリアする関数（必要に応じて）
export const clearYoutubeTagsCache = (youtubeLinkId: number | null = null) => {
  if (youtubeLinkId) {
    const cacheKey = getCacheKey(youtubeLinkId);
    cache.delete(cacheKey);
  } else {
    // 全てのYouTubeタグ関連のキャッシュをクリア
    const keys = Array.from(cache.keys());
    for (const key of keys) {
      if (key.startsWith("youtube_tags_") || key === "all_youtube_tags") {
        cache.delete(key);
      }
    }
  }
};

// キャッシュ統計を取得する関数（デバッグ用）
export const getYoutubeTagsCacheStats = () => {
  const stats = {
    totalItems: cache.size,
    items: Array.from(cache.entries()).map(([key, item]) => ({
      key,
      isExpired: isExpired(item),
      age: Date.now() - item.timestamp,
      ttl: item.ttl,
    })),
  };
  return stats;
};
