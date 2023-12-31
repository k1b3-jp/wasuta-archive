import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import formatDate from '@/utils/formatDate';
import Image from 'next/image';
import DefaultLayout from '@/app/layout';

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
  console.log('params', context.params.id);
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
      .from('Event_Youtube_Links')
      .select(
        `
        youtube_link_id,
        Youtube_Links (
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
  const [isEditMode, setIsEditMode] = useState(false);

  // 編集モードの切り替え
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // イベント編集フォームの送信処理
  const handleEditSubmit = async (updatedEvent) => {
    // Supabaseを使った更新ロジックを実装してください
  };

  // 新しいYouTubeリンクの追加処理
  const handleAddYoutubeLink = async (url) => {
    // Supabaseを使って新しいYouTubeリンクを追加するロジックを実装してください
  };

  return (
    <DefaultLayout>
      <div>
        {/* 編集モードのUIを条件に応じて表示 */}
        {isEditMode ? (
          // イベント詳細の編集フォーム
          <form onSubmit={handleEditSubmit}>{/* 編集フィールド */}</form>
        ) : (
          // イベント詳細の表示
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
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.url}
                </a>
              </div>
            ))}
          </div>
        )}

        {/* 編集モード切替ボタン */}
        <button onClick={toggleEditMode}>
          {isEditMode ? '編集をキャンセル' : 'イベントを編集'}
        </button>

        {/* 編集モード時にYouTubeリンク追加UIを表示 */}
        {isEditMode && (
          <div>
            {/* 新しいYouTubeリンク追加フォーム */}
            <form onSubmit={handleAddYoutubeLink}>
              {/* YouTubeリンク入力フィールド */}
            </form>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default EventDetailsPage;
