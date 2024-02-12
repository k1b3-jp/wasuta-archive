import { YouTubeEmbed } from '@next/third-parties/google';
import React, { useEffect, useState } from 'react';
import { getYoutubeTags } from '@/lib/supabase/getYoutubeTags';
import { TagType } from '@/types/tag';
import MiniTag from '../ui/MiniTag';

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
  };

  return (
    <div>
      <div className="mb-2">
        {videoId ? <YouTubeEmbed videoid={videoId} /> : <p>Invalid URL</p>}
      </div>
      <div className="min-h-[28px]">
        {youtubeTags?.map((tag: { id: React.Key | null | undefined; label: string }) => (
          <MiniTag key={tag.id} label={tag.label} />
        ))}
      </div>
    </div>
  );
};

export default MovieCard;
