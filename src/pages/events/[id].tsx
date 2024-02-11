import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DefaultLayout from '@/app/layout';
import MovieCard from '@/components/events/MovieCard';
import BaseButton from '@/components/ui/BaseButton';
import Tag from '@/components/ui/Tag';
import { createYoutubeLink } from '@/lib/supabase/createYoutubeLink';
import { getMovies } from '@/lib/supabase/getMovies';
import { getYoutubeTags } from '@/lib/supabase/getYoutubeTags';
import { Movie } from '@/types/movie';
import { TagType } from '@/types/tag';
import formatDate from '@/utils/formatDate';
import { supabase } from '../../lib/supabaseClient';

// イベント詳細ページのプロパティ型定義
interface EventDetailsProps {
  event: any; // イベントデータの型を適宜設定してください
  youtubeLinks: any[]; // YouTubeリンクデータの型を適宜設定してください
}

const defaultImageUrl = '/event-placeholder.png';

// イベント詳細ページのデータ取得処理
export const getStaticPaths = async () => {
  // 全イベントのIDを取得
  const { data: events, error } = await supabase.from('events').select('event_id');

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
  let youtubeLinks: Movie[] = [];

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
    let linksData: Movie[], linksError;
    try {
      linksData = await getMovies({ eventId: id, limit: 6 });
    } catch (error) {
      console.error(`Error fetching movies: ${(error as any).message}`);
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

  const [allYoutubeTags, setAllYoutubeTags] = useState<TagType[]>([]);
  const [selectedYoutubeTags, setSelectedYoutubeTags] = useState<TagType[]>([]);
  const fetchAllYoutubeTags = async () => {
    const tags = await getYoutubeTags();
    if (tags) {
      setAllYoutubeTags(tags);
    }
  };
  const handleYoutubeTagSelect = (tag: TagType) => {
    if (selectedYoutubeTags.some((t) => t.id === tag.id)) {
      setSelectedYoutubeTags(selectedYoutubeTags.filter((t) => t.id !== tag.id));
    } else {
      setSelectedYoutubeTags([...selectedYoutubeTags, tag]);
    }
  };

  const router = useRouter();
  const query = useSearchParams();
  const toastParams = query?.get('toast');

  useEffect(() => {
    if (toastParams === 'success') {
      toast.success('保存しました🌏');
    }
    validateAccess();
    fetchAllYoutubeTags();
  }, [toastParams]);

  // YouTubeリンクの追加処理
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (isLoggedIn) {
      try {
        const selectedYoutubeTagIds = selectedYoutubeTags.map((tag) => tag.id);
        const insertedData = await createYoutubeLink(url, selectedYoutubeTagIds, id);
        toast.success('動画を登録しました🌏');
        router.push(`/events/${id}`);
        setUrl('');
        setSelectedYoutubeTags([]);
      } catch (error) {
        if ((error as any).code === '23505') {
          toast.error('その動画は既に登録されています。別のURLを入力してください🙇‍♂️');
        } else {
          toast.error(`動画の登録中にエラーが発生しました😢（${error}）`);
        }
      }
    } else {
      toast.error('ログインが必要です🙇‍♂️');
    }
  };

  return (
    <DefaultLayout>
      <div>
        <div className="event">
          <div className="event-head bg-100vw bg-light-gray p-8">
            <Image
              src={event.image_url || defaultImageUrl}
              alt={event.event_name}
              width={500}
              height={300}
              className="mx-auto"
            />
          </div>
          <div className="event-detail p-8">
            <h1 className="text-font-color font-bold text-2xl mb-6">{event.event_name}</h1>
            <h4 className="text-lg mb-4">日付：{formatDate(event.date)}</h4>
            <h4 className="text-lg mb-4">場所：{event.location}</h4>
            <p className="mb-4">{event.description}</p>
            <BaseButton link={`/events/${id}/edit`} label="イベントを編集"></BaseButton>
          </div>
          {/* YouTubeリンクの表示 */}
          <div className="event-movie bg-light-gray bg-100vw">
            <div className="container mx-auto p-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-font-color">MOVIE</h3>
                <BaseButton label="もっと見る" link={`/events/${id}/movie`} />
              </div>
              <div
                style={{ marginRight: 'calc(50% - 50vw)' }}
                className="movie-list min-h-60 flex items-center overflow-scroll mb-6"
              >
                {youtubeLinks.length > 0 ? (
                  youtubeLinks.map((link) => (
                    <div key={link.youtube_link_id} className="min-w-80 m-2">
                      <MovieCard
                        videoUrl={link.youtube_links.url}
                        id={link.youtube_link_id}
                      ></MovieCard>
                    </div>
                  ))
                ) : (
                  <p>動画が登録されていません😢</p>
                )}{' '}
              </div>
              {/* Youtubeリンクに新規登録するフォーム */}
              <div className="add-movie bg-white p-8 rounded-lg border border-gray-100">
                <h4 className="text-xl font-bold text-deep-green mb-10">動画の登録</h4>
                <div className="mb-8">
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
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
                      key={tag.id}
                      label={tag.label}
                      selected={selectedYoutubeTags.some((t) => t.id === tag.id)}
                      onSelect={() => handleYoutubeTagSelect(tag)}
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
