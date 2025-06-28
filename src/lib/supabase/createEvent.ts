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

  try {
    // 1. イベントを挿入
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

    const insertedEventId = insertedData[0].event_id;

    // 2. イベントタグを挿入（外部キー制約によりタグの存在チェック済み）
    if (tags.length > 0) {
      const eventTagData = tags.map((tagId) => ({
        event_id: insertedEventId,
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase
        .from("event_tags")
        .insert(eventTagData);

      if (tagError) {
        // タグ挿入に失敗した場合、イベントも削除してデータの整合性を保つ
        // 外部キー制約エラーの場合、適切なエラーメッセージを返す
        try {
          await supabase
            .from("events")
            .delete()
            .eq("event_id", insertedEventId);
        } catch (deleteError) {
          console.error(
            "Failed to cleanup event after tag insertion failure:",
            deleteError
          );
          // 削除に失敗した場合でも、元のタグエラーを投げる
        }

        // タグが存在しない場合の分かりやすいエラーメッセージ
        if (tagError.code === "23503") {
          // 外部キー制約違反
          throw new Error("指定されたタグIDが存在しません。");
        }
        throw tagError;
      }
    }

    return insertedData;
  } catch (error) {
    console.error("Error in createEvent:", error);
    throw error;
  }
};

export default createEvent;
