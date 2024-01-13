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
    let { data: linksData, error: linksError } = await supabase
      .from('event_youtube_links')
      .select(
        `
        youtube_link_id,
        youtube_links (
          url
        )
      `,
      )
      .eq('event_id', id);

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
        console.log('insertedData', insertedData);
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
        <div>
          <h1>{event.event_name}</h1>
          <p>{formatDate(event.event_time)}</p>
          <p>{event.location}</p>
          <Image
            src={event.image_url || defaultImageUrl}
            alt={event.event_name}
            width={500}
            height={300}
          />
          {/* YouTubeリンクの表示 */}
          {youtubeLinks.map((link) => (
            <div key={link.youtube_link_id}>
              <MovieCard videoUrl={link.youtube_links.url}></MovieCard>
            </div>
          ))}
          {/* Youtubeリンクに新規登録するフォーム */}
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700"
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
          <div className="flex flex-wrap gap-2 my-4">
            {allYoutubeTags.map((tag) => (
              <Tag
                key={tag.id} // タグのIDをkeyプロパティとして使用
                label={tag.label} // タグの名前をlabelプロパティとして使用
                selected={selectedYoutubeTags.includes(tag.id)}
                onSelect={() => handleYoutubeTagSelect(tag.id)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Link
          </button>
        </div>
        <Link href={`/events/${id}/edit`}>イベントを編集</Link>
      </div>
    </DefaultLayout>
  );
};

export default EventDetailsPage;
