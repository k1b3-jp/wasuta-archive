import { supabase } from "../supabaseClient";

interface EventData {
  eventName: string;
  date: string;
  location?: string;
  imageUrl?: string;
  description: string;
}

const createEvent = async (data: EventData, tags: number[]) => {
  const { eventName, date, location, imageUrl, description } = data;

  let insertedEventId: number | null = null;

  try {
    // 1. タグIDの有効性をチェック（オプション：存在しないタグIDを事前に検出）
    if (tags.length > 0) {
      const { data: existingTags, error: tagCheckError } = await supabase
        .from("event_tag_names")
        .select("tag_id")
        .in("tag_id", tags);

      if (tagCheckError) throw tagCheckError;

      const existingTagIds = existingTags.map((tag) => tag.tag_id);
      const invalidTags = tags.filter(
        (tagId) => !existingTagIds.includes(tagId)
      );

      if (invalidTags.length > 0) {
        throw new Error(`Invalid tag IDs: ${invalidTags.join(", ")}`);
      }
    }

    // 2. イベントを挿入
    const { data: insertedData, error: eventInsertError } = await supabase
      .from("events")
      .insert([
        {
          event_name: eventName,
          date: new Date(date),
          location,
          image_url: imageUrl,
          description,
        },
      ])
      .select();

    if (eventInsertError) throw eventInsertError;

    insertedEventId = insertedData[0].event_id;

    // 3. イベントタグを挿入
    if (tags.length > 0) {
      const eventTagData = tags.map((tagId) => ({
        event_id: insertedEventId,
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase
        .from("event_tags")
        .insert(eventTagData);

      if (tagError) {
        // タグ挿入に失敗した場合、挿入したイベントを削除（補償処理）
        await supabase.from("events").delete().eq("event_id", insertedEventId);

        throw tagError;
      }
    }

    return insertedData;
  } catch (error) {
    console.error("Error in createEvent:", error);

    // 予期しないエラーが発生した場合も、挿入したイベントがあればクリーンアップ
    if (insertedEventId) {
      try {
        await supabase.from("events").delete().eq("event_id", insertedEventId);
      } catch (cleanupError) {
        console.error("Error cleaning up inserted event:", cleanupError);
      }
    }

    throw error;
  }
};

export default createEvent;
