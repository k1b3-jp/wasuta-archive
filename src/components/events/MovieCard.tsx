import React from 'react';
import { YouTubeEmbed } from '@next/third-parties/google';

export function extractYouTubeVideoId(url: string): string | null {
  const matched =
    /^https?:\/\/(www\.)?youtube\.com\/watch\?(.*&)?v=(?<videoId>[^&]+)/.exec(
      url,
    ) ??
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
}

const MovieCard: React.FC<MovieCardProps> = ({ videoUrl }) => {
  const videoId = extractYouTubeVideoId(videoUrl); // URLからビデオIDを抽出
  console.log('videoUrl', videoUrl);
  console.log('videoId', videoId);

  return (
    <div>
      {videoId ? <YouTubeEmbed videoid={videoId} /> : <p>Invalid URL</p>}
    </div>
  );
};

export default MovieCard;
