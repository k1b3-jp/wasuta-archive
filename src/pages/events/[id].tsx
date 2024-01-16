import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import formatDate from '@/utils/formatDate';
import Image from 'next/image';
import DefaultLayout from '@/app/layout';
import Link from 'next/link';
import Tag from '@/components/ui/Tag';
import { getYoutubeTags } from '@/lib/supabase/getYoutubeTags';
import { createYoutubeLink } from '@/lib/supabase/createYoutubeLink';
import MovieCard from '@/components/events/MovieCard';
import BaseButton from '@/components/ui/BaseButton';
import { getMovies } from '@/lib/supabase/getMovies';

// イベント詳細ページのプロパティ型定義
interface EventDetailsProps {
  event: any; // イベントデータの型を適宜設定してください
  youtubeLinks: any[]; // YouTubeリンクデータの型を適宜設定してください
}

const defaultImageUrl = '/event-placeholder.png';

// イベント詳細ページのデータ取得処理
export const getStaticPaths = async () => {
  // 全イベントのIDを取得
  const { data: events, error } = await supabase
    .from('events')
    .select('event_id');

  // パスオブジェクトの配列を生成
  const paths = events?.map((event) => ({
    params: { id: event.event_id.toString() },
  }));

  // fallback: false は、リストにないパスにアクセスした場合は404ページを表示する
  return { paths, fallback: false };
};

export const getStaticProps = async (context: any) => {
  const { id } = context.params;

  let event = null;
  let youtubeLinks = [];

  try {
    // IDに基づいてイベントの詳細を取得
    let { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('event_id', id)
      .single();

    if (eventError) throw eventError;

    if (!eventData) {
      console.error('eventData is null');
    } else {
      event = eventData;
    }

    // イベントに紐づくYouTubeリンクを取得
    let linksData, linksError;
    try {
      linksData = await getMovies({ eventId: id, limit: 6 });
    } catch (error) {
      console.error(`Error fetching movies: ${error.message}`);
      linksData = [];
    }

    if (linksError) throw linksError;

    youtubeLinks = linksData;
  } catch (error) {
    console.error('Error fetching data:', error);
    // エラーハンドリング: 必要に応じて適切な処理を行う
  }

  // 成功した場合、取得したデータをpropsとして返す
  return {
    props: {
      event, // eventがundefinedの場合はnullを返す
      youtubeLinks,
    },
    revalidate: 10, // ISRを利用する場合、ページの再生成間隔を秒単位で指定
  };
};

const EventDetailsPage = ({ event, youtubeLinks }: EventDetailsProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const validateAccess = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session !== null) {
      setIsLoggedIn(true);
    }
  };

  const id = event?.event_id;
  const [url, setUrl] = useState('');

  const [allYoutubeTags, setAllYoutubeTags] = useState([]);
  const [selectedYoutubeTags, setSelectedYoutubeTags] = useState([]);
  const fetchAllYoutubeTags = async () => {
    const tags = await getYoutubeTags();
    setAllYoutubeTags(tags);
  };
  const handleYoutubeTagSelect = (tag) => {
    if (selectedYoutubeTags.includes(tag)) {
      setSelectedYoutubeTags(selectedYoutubeTags.filter((t) => t !== tag));
    } else {
      setSelectedYoutubeTags([...selectedYoutubeTags, tag]);
    }
  };

  useEffect(() => {
    validateAccess();
    fetchAllYoutubeTags();
  }, []);

  // YouTubeリンクの追加処理
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoggedIn) {
      // TODO: バリデーション
      // if (!validateFields({ url })) return;

      try {
        const insertedData = await createYoutubeLink(
          url,
          selectedYoutubeTags,
          id,
        );
        // TODO: Reset form or redirect user
      } catch (error) {
        console.error('Error creating Youtube Link', error);
      }
    } else {
      console.error('No user logged in');
    }
  };

  return (
    <DefaultLayout>
      <div>
        <div className="event">
          <div className="event-head bg-100vw bg-light-pink p-16">
            <Image
              src={event.image_url || defaultImageUrl}
              alt={event.event_name}
              width={500}
              height={300}
              className="mx-auto"
            />
          </div>
          <div className="event-detail p-16">
            <h1 className="text-deep-pink font-bold text-2xl mb-6">
              {event.event_name}
            </h1>
            <h4 className="text-lg mb-4">
              日時：{formatDate(event.event_time)}
            </h4>
            <h4 className="text-lg mb-4">場所：{event.location}</h4>
            <p className="p-4 mb-4">{event.description}</p>
            <BaseButton
              link={`/events/${id}/edit`}
              label="イベントを編集"
            ></BaseButton>
          </div>
          {/* YouTubeリンクの表示 */}
          <div className="event-movie bg-light-pink bg-100vw">
            <div className="container mx-auto p-16">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">MOVIE</h3>
                <BaseButton
                  label="もっと見る"
                  link={`/events/${id}/movie`}
                  yellow
                />
              </div>
              <div
                style={{ marginRight: 'calc(50% - 50vw)' }}
                className="movie-list min-h-60 flex items-center overflow-scroll mb-6"
              >
                {youtubeLinks.length > 0 ? (
                  youtubeLinks.map((link) => (
                    <div key={link.youtube_link_id} className="min-w-80 m-4">
                      <MovieCard videoUrl={link.youtube_links.url}></MovieCard>
                    </div>
                  ))
                ) : (
                  <p>動画が登録されていません😢</p>
                )}{' '}
              </div>
              {/* Youtubeリンクに新規登録するフォーム */}
              <div className="add-movie bg-white p-10 rounded-lg border border-gray-100">
                <h4 className="text-xl font-bold text-deep-blue mb-10">
                  動画の登録
                </h4>
                <div className="mb-8">
                  <label
                    htmlFor="url"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    URL
                  </label>
                  <input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <label className="block text-sm font-bold mb-2">タグ</label>
                <div className="flex flex-wrap gap-2 mb-8">
                  {allYoutubeTags.map((tag) => (
                    <Tag
                      key={tag.id} // タグのIDをkeyプロパティとして使用
                      label={tag.label} // タグの名前をlabelプロパティとして使用
                      selected={selectedYoutubeTags.includes(tag.id)}
                      onSelect={() => handleYoutubeTagSelect(tag.id)}
                    />
                  ))}
                </div>
                <BaseButton label="登録する" onClick={handleSubmit} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EventDetailsPage;
