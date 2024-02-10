import { YouTubeEmbed } from '@next/third-parties/google';
import React, { useEffect, useState } from 'react';
import { getYoutubeTags } from '@/lib/supabase/getYoutubeTags';
import { TagType } from '@/types/tag';

export function extractYouTubeVideoId(url: string): string | null {
  const matched =
    /^https?:\/\/(www\.)?youtube\.com\/watch\?(.*&)?v=(?<videoId>[^&]+)/.exec(url) ??
    /^https?:\/\/youtu\.be\/(?<videoId>[^?]+)/.exec(url) ??
    /^https?:\/\/(www\.)?youtube\.com\/embed\/(?<videoId>[^?]+)/.exec(url);

  if (matched?.groups?.videoId) {
    return matched.groups.videoId;
  } else {
    return null;
  }
}

interface MovieCardProps {
  videoUrl: string;
  id: number;
}

const MovieCard: React.FC<MovieCardProps> = ({ videoUrl, id }) => {
  const videoId = extractYouTubeVideoId(videoUrl); // URLからビデオIDを抽出

  //idに紐づくタグを取得する
  const [youtubeTags, setYoutubeTags] = useState<TagType[] | undefined>([]);

  useEffect(() => {
    fetchyoutubeTags();
  }, [id]);

  const fetchyoutubeTags = async () => {
    const tags = await getYoutubeTags(id);
    setYoutubeTags(tags);
    console.log(tags);
  };

  return (
    <div>
      {videoId ? <YouTubeEmbed videoid={videoId} /> : <p>Invalid URL</p>}
      {youtubeTags?.map(
        (tag: { id: React.Key | null | undefined; label: string | null | undefined }) => (
          <span
            key={tag.id}
            className="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded ms-1"
          >
            {tag.label}
          </span>
        ),
      )}
    </div>
  );
};

export default MovieCard;
