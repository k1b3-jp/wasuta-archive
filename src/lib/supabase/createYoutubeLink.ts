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

export const createYoutubeLink = async (url: string, tags: number[], eventId: number) => {
  if (!validateUrl(url)) throw new Error("URLが正しいYoutubeのリンクではありません");
  url = cleanYouTubeUrl(url);
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  const res = await fetch("/api/youtube/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ url, tags, eventId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "unknown" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
};

export default createYoutubeLink;
