import { supabase } from "../supabaseClient";

interface GetMoviesOptions {
  eventId?: number;
  limit?: number;
  tags?: number[];
  start?: number;
  end?: number;
  ascending?: boolean;
}

export const getMovies = async (options?: GetMoviesOptions) => {
  let query = supabase.from("event_youtube_links").select(
    `
      youtube_link_id,
      youtube_links (
        url
      )
    `
  );

  if (options?.eventId) {
    query = query.eq("event_id", options.eventId);
  }

  if (options?.tags && options.tags.length > 0) {
    // Youtube_Tagsをフィルタリング
    const tagQuery = supabase
      .from("youtube_tags")
      .select("youtube_link_id")
      .in("tag_id", options.tags);

    const { data: tagData, error: tagError } = await tagQuery;

    if (tagError) {
      console.error("Error fetching tag data:", tagError);
      throw new Error(`Error fetching tag data: ${tagError.message}`);
    }

    let youtubeLinkIds: number[] = [];
    if (tagData) {
      // 有効なyoutube_link_idのみを含める
      youtubeLinkIds = tagData
        .filter(
          (tag) =>
            tag.youtube_link_id &&
            Number.isInteger(tag.youtube_link_id) &&
            tag.youtube_link_id > 0
        )
        .map((tag) => tag.youtube_link_id);

      console.log("Filtered YouTube link IDs from tags:", youtubeLinkIds);
    }

    // youtube_link_idが存在する場合のみフィルタリング
    if (youtubeLinkIds.length > 0) {
      query = query.in("youtube_link_id", youtubeLinkIds);
    } else {
      // タグでフィルタリングしたが該当するyoutube_link_idがない場合は空の結果を返す
      return [];
    }
  }

  query = query.order("youtube_link_id", {
    ascending: options?.ascending ?? false,
  });

  // リミットが指定されていれば適用します
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  // ページネーションのためのオプションを適用します
  const start = options?.start || 0;
  const end = options?.end || 9;
  query = query.range(start, end);

  const { data: movies, error } = await query;

  if (error) throw new Error(`Error fetching Youtube links: ${error?.message}`);

  // 返されたデータの検証とフィルタリング
  if (movies) {
    const validMovies = movies.filter((movie) => {
      if (!movie || typeof movie !== "object") {
        console.warn("Invalid movie object:", movie);
        return false;
      }
      if (
        !movie.youtube_link_id ||
        !Number.isInteger(movie.youtube_link_id) ||
        movie.youtube_link_id <= 0
      ) {
        console.warn("Movie with invalid youtube_link_id:", movie);
        return false;
      }
      return true;
    });

    console.log(
      `Filtered ${movies.length - validMovies.length} invalid movies out of ${
        movies.length
      } total`
    );
    return validMovies;
  }

  return movies;
};

export default getMovies;
