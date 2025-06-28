import { supabase } from "../supabaseClient";

export function validateUrl(url: string) {
  // YouTubeのビデオページ、短縮URL、埋め込みページの形式にマッチする正規表現を一つに組み合わせる
  const youtubeRegex =
    /^(https?:\/\/)?((www\.|m\.)?youtube\.com\/watch\?.*v=([^&]+).*|youtu\.be\/([^?]+)(\?.*)?)$/;

  return youtubeRegex.test(url);
}

export function cleanYouTubeUrl(url: string) {
  // URLオブジェクトを作成
  const urlObj = new URL(url);

  // ドメインがyoutu.beの場合は、youtube.comのwatchページのURLに変換
  if (urlObj.hostname === "youtu.be") {
    // 動画IDをパスから取得
    const videoId = urlObj.pathname.substring(1);
    const newUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // 新しいURLオブジェクトを作成して、ドメインとパスを更新
    return newUrl;
  } else {
    // ドメインをyoutube.comに統一
    urlObj.hostname = "www.youtube.com";

    // クエリパラメータからvパラメータ以外を削除
    const searchParams = urlObj.searchParams;
    const videoId = searchParams.get("v");
    searchParams.forEach((value, key) => {
      if (key !== "v") {
        searchParams.delete(key);
      }
    });

    // 更新されたURLを返す
    return urlObj.toString();
  }
}

export const createYoutubeLink = async (
  url: string,
  tags: number[],
  eventId: number
) => {
  if (!validateUrl(url)) {
    throw new Error("URLが正しいYoutubeのリンクではありません");
  }

  url = cleanYouTubeUrl(url);

  // Youtubeリンクを追加
  const { data: linkData, error: linkError } = await supabase
    .from("youtube_links")
    .insert([{ url: url }])
    .select();

  if (linkError) throw linkError;

  // Youtubeタグを追加
  const youtubeTagData = tags.map((tagId) => ({
    youtube_link_id: linkData[0].youtube_link_id,
    tag_id: tagId,
  }));

  const { error: tagError } = await supabase
    .from("youtube_tags")
    .insert(youtubeTagData);

  if (tagError) throw tagError;

  // イベントとYoutubeリンクを関連付け
  const { error: eventLinkError } = await supabase
    .from("event_youtube_links")
    .insert([
      { event_id: eventId, youtube_link_id: linkData[0].youtube_link_id },
    ]);

  if (eventLinkError)
    throw new Error(
      `Error linking Youtube to event: ${eventLinkError.message}`
    );
};

export default createYoutubeLink;
