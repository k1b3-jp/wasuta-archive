# わーすたアーカイブ - 開発者向けガイド

## 目次
1. [セットアップ](#1-セットアップ)
2. [開発ワークフロー](#2-開発ワークフロー)
3. [コーディング規約](#3-コーディング規約)
4. [コンポーネント開発](#4-コンポーネント開発)
5. [状態管理](#5-状態管理)
6. [データフェッチング](#6-データフェッチング)
7. [スタイリング](#7-スタイリング)
8. [テスト](#8-テスト)
9. [デバッグ](#9-デバッグ)
10. [トラブルシューティング](#10-トラブルシューティング)

---

## 1. セットアップ

### 1.1 必須環境

- **Node.js**: 20.10.0
- **Yarn**: 4.1.0
- **Git**: 2.37.3+

### 1.2 推奨ツール

- **Volta**: Node.jsバージョン管理（推奨）
- **VS Code**: エディタ
  - 推奨拡張機能:
    - Biome
    - TypeScript
    - Tailwind CSS IntelliSense
    - ES7+ React/Redux/React-Native snippets

### 1.3 初回セットアップ手順

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd wasuta-archive

# 2. 依存関係をインストール
yarn install

# 3. 環境変数ファイルを作成
cp .env.local.example .env.local

# 4. 環境変数を設定（Supabaseの情報など）
# .env.localを編集
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 5. 開発サーバーを起動
yarn dev
```

### 1.4 Voltaのセットアップ（任意）

```bash
# Voltaをインストール
curl https://get.volta.sh | bash

# プロジェクトで指定されたNode.js/Yarnバージョンが自動で使用される
cd wasuta-archive
```

### 1.5 Supabaseのセットアップ

1. Supabaseプロジェクトを作成
2. データベーステーブルを作成（`supabase/`ディレクトリのマイグレーションファイル参照）
3. ストレージバケットを作成
4. 認証設定を有効化
5. 環境変数に接続情報を設定

---

## 2. 開発ワークフロー

### 2.1 利用可能なコマンド

```bash
# 開発サーバー起動（http://localhost:3000）
yarn dev

# 本番ビルド
yarn build

# 本番サーバー起動
yarn start

# リント実行（自動修正付き）
yarn lint

# フォーマット実行
yarn format

# リント+フォーマット実行
yarn check

# Storybook起動（http://localhost:6006）
yarn storybook

# Storybookビルド
yarn build-storybook

# バンドルサイズ解析
yarn analyze
```

### 2.2 ブランチ戦略

```
main (本番環境)
  ↑
develop (開発環境)
  ↑
feature/* (機能開発)
  or
fix/* (バグ修正)
```

#### ブランチ作成例

```bash
# 機能開発
git checkout develop
git pull origin develop
git checkout -b feature/add-comment-system

# バグ修正
git checkout develop
git pull origin develop
git checkout -b fix/event-card-layout
```

### 2.3 コミットメッセージ

```
<type>: <subject>

<body>
```

#### Type一覧
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: フォーマット、セミコロンなど
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルド、補助ツールなど

#### 例

```bash
git commit -m "feat: イベントカードにお気に入り機能を追加"
git commit -m "fix: MovieCardコンポーネントのレスポンシブ表示を修正"
```

### 2.4 プルリクエスト

1. 変更をcommit & push
2. GitHubでPR作成
3. レビューを受ける
4. 承認後、`develop`にマージ
5. 定期的に`develop` → `main`へマージ

---

## 3. コーディング規約

### 3.1 TypeScript

#### 型定義
```typescript
// ✅ Good: 明示的な型定義
interface Event {
  id: string;
  title: string;
  date: Date;
  tags: Tag[];
}

// ❌ Bad: anyの使用
const event: any = { ... };
```

#### 型エクスポート
```typescript
// src/types/ ディレクトリで型を定義
// event.d.ts
export interface Event {
  id: string;
  title: string;
}

// 使用箇所
import type { Event } from '@/types/event';
```

### 3.2 React コンポーネント

#### 関数コンポーネント

```typescript
// ✅ Good: 関数宣言（ファイル名と一致）
export function EventCard({ event }: EventCardProps) {
  return <div>...</div>;
}

// または Arrow Function
export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return <div>...</div>;
};
```

#### Props定義

```typescript
interface EventCardProps {
  event: Event;
  onEdit?: (id: string) => void;
  className?: string;
}

export function EventCard({ 
  event, 
  onEdit, 
  className 
}: EventCardProps) {
  // ...
}
```

### 3.3 ファイル命名規則

```
PascalCase: コンポーネント、型定義
  EventCard.tsx
  Event.d.ts

camelCase: ユーティリティ、フック、関数
  formatDate.ts
  useMobile.tsx
  getEvents.ts

kebab-case: 設定ファイル
  next.config.js
  tailwind.config.ts
```

### 3.4 インポート順序

```typescript
// 1. 外部ライブラリ
import React from 'react';
import { useRouter } from 'next/router';

// 2. 内部モジュール
import { getEvents } from '@/lib/supabase/getEvents';
import { EventCard } from '@/components/events/EventCard';

// 3. 型定義
import type { Event } from '@/types/event';

// 4. スタイル
import styles from './styles.module.scss';
```

### 3.5 コメント

```typescript
// ✅ Good: 複雑なロジックに簡潔なコメント
// 過去3ヶ月のイベントのみフィルタリング
const recentEvents = events.filter(e => 
  isWithinInterval(e.date, { start: threeMonthsAgo, end: now })
);

// ❌ Bad: 自明なコメント
// イベント一覧を取得する
const events = await getEvents();
```

### 3.6 Biome設定

プロジェクトは`.biome.json`でコーディング規約を管理しています。

```bash
# 自動修正
yarn check

# または個別に
yarn lint
yarn format
```

---

## 4. コンポーネント開発

### 4.1 ディレクトリ構造

```
src/components/
├── events/          # イベント関連コンポーネント
├── navigation/      # ナビゲーション
└── ui/              # 共通UIコンポーネント
```

### 4.2 コンポーネント設計原則

#### Single Responsibility（単一責任）
```typescript
// ✅ Good: 1つの責務に集中
export function EventCard({ event }: EventCardProps) {
  return (
    <div className="card">
      <EventImage src={event.image} />
      <EventTitle>{event.title}</EventTitle>
      <EventDate date={event.date} />
    </div>
  );
}

// ❌ Bad: 複数の責務
export function EventCard({ event }: EventCardProps) {
  // データフェッチング、状態管理、表示を全て行う
  const [data, setData] = useState();
  useEffect(() => { fetch(...) }, []);
  // ...
}
```

#### Composition（合成）
```typescript
// 小さなコンポーネントを組み合わせる
<EventCard event={event}>
  <EventCard.Image src={event.image} />
  <EventCard.Content>
    <EventCard.Title>{event.title}</EventCard.Title>
    <EventCard.Tags tags={event.tags} />
  </EventCard.Content>
</EventCard>
```

### 4.3 Storybook活用

```typescript
// EventCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { EventCard } from './EventCard';

const meta: Meta<typeof EventCard> = {
  title: 'Events/EventCard',
  component: EventCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EventCard>;

export const Default: Story = {
  args: {
    event: {
      id: '1',
      title: 'わーすた LIVE 2024',
      date: new Date('2024-06-15'),
      // ...
    },
  },
};

export const WithLongTitle: Story = {
  args: {
    event: {
      ...Default.args.event,
      title: 'わーすた 10周年記念ライブ 〜感謝を込めて〜',
    },
  },
};
```

```bash
# Storybookで確認
yarn storybook
```

### 4.4 共通UIコンポーネント

```typescript
// BaseButton の使用例
import { BaseButton } from '@/components/ui/BaseButton';

<BaseButton
  variant="primary"
  size="md"
  onClick={handleClick}
>
  イベントを作成
</BaseButton>

// Tag の使用例
import { Tag } from '@/components/ui/Tag';

<Tag color="blue">ライブ</Tag>
<Tag color="red">限定</Tag>
```

---

## 5. 状態管理

### 5.1 ローカル状態（useState）

```typescript
import { useState } from 'react';

export function EventFilter() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  return (
    // JSX
  );
}
```

### 5.2 グローバル状態（Context）

```typescript
// AuthContext の使用例
import { useAuth } from '@/contexts/AuthContext';

export function EventCreatePage() {
  const { user, isAdmin } = useAuth();
  
  if (!isAdmin) {
    return <div>権限がありません</div>;
  }
  
  return (
    // JSX
  );
}
```

### 5.3 サーバー状態（SWR）

```typescript
import useSWR from 'swr';
import { getEvents } from '@/lib/supabase/getEvents';

export function EventList() {
  const { data: events, error, isLoading } = useSWR(
    'events',
    getEvents,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1分間キャッシュ
    }
  );
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>エラーが発生しました</div>;
  
  return (
    <div>
      {events?.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

---

## 6. データフェッチング

### 6.1 Supabase クライアント

```typescript
// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 6.2 データ取得パターン

```typescript
// getEvents.ts
import { supabase } from '@/lib/supabaseClient';
import type { Event } from '@/types/event';

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// タグでフィルタリング
export async function getEventsByTag(tagId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*, tags(*)')
    .contains('tags', [tagId])
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
}
```

### 6.3 データ作成・更新

```typescript
// createEvent.ts
import { supabase } from '@/lib/supabaseClient';
import type { Event } from '@/types/event';

export async function createEvent(event: Omit<Event, 'id'>): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// updateEvent.ts
export async function updateEvent(
  id: string, 
  updates: Partial<Event>
): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

### 6.4 ストレージ操作

```typescript
// uploadStorage.ts
import { supabase } from '@/lib/supabaseClient';

export async function uploadImage(
  file: File,
  bucket: string = 'events'
): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);
  
  if (error) throw error;
  
  // 公開URLを取得
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
  
  return publicUrl;
}
```

---

## 7. スタイリング

### 7.1 TailwindCSS（主要）

```typescript
// ユーティリティクラスを使用
export function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {event.title}
      </h2>
      <p className="text-gray-600 text-sm">
        {formatDate(event.date)}
      </p>
    </div>
  );
}
```

#### 条件付きクラス（clsx）

```typescript
import clsx from 'clsx';

export function BaseButton({ variant, size, className }: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded font-medium transition-colors',
        {
          'bg-blue-500 text-white hover:bg-blue-600': variant === 'primary',
          'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
          'px-3 py-1 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
    >
      {children}
    </button>
  );
}
```

### 7.2 SCSS/CSS Modules

```scss
// EventCard.module.scss
.card {
  background: white;
  border-radius: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .title {
    font-size: 1.25rem;
    font-weight: bold;
  }
}
```

```typescript
import styles from './EventCard.module.scss';

export function EventCard({ event }: EventCardProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{event.title}</h2>
    </div>
  );
}
```

### 7.3 レスポンシブデザイン

```typescript
// Tailwind レスポンシブユーティリティ
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {events.map(event => (
    <EventCard key={event.id} event={event} />
  ))}
</div>

// カスタムフック
import { useMobile } from '@/hooks/useMobile';

export function EventList() {
  const isMobile = useMobile();
  
  return (
    <div className={isMobile ? 'grid-cols-1' : 'grid-cols-3'}>
      {/* ... */}
    </div>
  );
}
```

### 7.4 アイコン

```typescript
// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faShare } from '@fortawesome/free-solid-svg-icons';

<FontAwesomeIcon icon={faHeart} className="text-red-500" />
<FontAwesomeIcon icon={faShare} size="lg" />

// Lucide React
import { Heart, Share2 } from 'lucide-react';

<Heart className="w-5 h-5 text-red-500" />
<Share2 className="w-5 h-5" />
```

---

## 8. テスト

### 8.1 コンポーネントテスト（Storybook）

```bash
# Storybook起動
yarn storybook

# ビルドして静的確認
yarn build-storybook
```

### 8.2 手動テスト

```bash
# 開発環境で動作確認
yarn dev

# 本番ビルドで確認
yarn build
yarn start
```

### 8.3 テストチェックリスト

- [ ] デスクトップ表示
- [ ] モバイル表示
- [ ] タブレット表示
- [ ] ダークモード（該当する場合）
- [ ] 各ブラウザでの動作（Chrome, Safari, Firefox）
- [ ] ログイン状態/未ログイン状態
- [ ] 管理者/一般ユーザー権限
- [ ] エラーケース（ネットワークエラー、404など）

---

## 9. デバッグ

### 9.1 開発ツール

```typescript
// console.log（開発時のみ）
if (process.env.NODE_ENV === 'development') {
  console.log('Event data:', event);
}

// React DevTools
// ブラウザ拡張機能をインストール
```

### 9.2 Next.js デバッグ

```bash
# 詳細なエラー情報を表示
NODE_OPTIONS='--inspect' yarn dev
```

### 9.3 Supabase デバッグ

```typescript
// クエリのログ出力
const { data, error } = await supabase
  .from('events')
  .select('*');

console.log('Supabase response:', { data, error });

if (error) {
  console.error('Supabase error:', error.message, error.details);
}
```

---

## 10. トラブルシューティング

### 10.1 よくある問題

#### 依存関係のエラー

```bash
# node_modules を削除して再インストール
rm -rf node_modules yarn.lock
yarn install
```

#### ビルドエラー

```bash
# キャッシュをクリア
rm -rf .next
yarn build
```

#### TypeScript エラー

```bash
# 型定義を再生成
yarn tsc --noEmit

# VS Code の TypeScript サーバーを再起動
# Command Palette → "TypeScript: Restart TS Server"
```

#### Supabase接続エラー

```bash
# 環境変数を確認
cat .env.local

# Supabaseプロジェクトの接続情報を確認
# https://app.supabase.com/
```

### 10.2 パフォーマンス問題

```bash
# バンドルサイズを解析
yarn analyze

# Lighthouseで分析
# Chrome DevTools → Lighthouse
```

### 10.3 スタイルが反映されない

```bash
# Tailwind キャッシュをクリア
rm -rf .next
yarn dev

# Biomeでフォーマット
yarn format
```

---

## 11. 参考資料

### 11.1 公式ドキュメント

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Supabase](https://supabase.com/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Biome](https://biomejs.dev/)
- [Storybook](https://storybook.js.org/docs)

### 11.2 コミュニティ

- Next.js Discord
- React Discord
- Supabase Discord

### 11.3 学習リソース

- [Next.js Learn](https://nextjs.org/learn)
- [React Tutorial](https://react.dev/learn)
- [Supabase Tutorials](https://supabase.com/docs/guides)

---

## 12. ベストプラクティス

### 12.1 パフォーマンス

- 画像は必ず最適化（Next.js Image コンポーネント使用）
- コンポーネントのメモ化（React.memo、useMemo、useCallback）
- 動的インポートで必要なコードのみ読み込み
- SWRでデータキャッシング

### 12.2 セキュリティ

- 環境変数に機密情報を保存
- XSS対策（ユーザー入力のサニタイズ）
- Supabase RLSで行レベルセキュリティ
- 管理者機能への適切なアクセス制御

### 12.3 アクセシビリティ

- セマンティックHTML使用
- aria-label、aria-labelledby設定
- キーボード操作対応
- 適切なコントラスト比

### 12.4 保守性

- コンポーネントは小さく、再利用可能に
- 適切な型定義
- 意味のある変数名・関数名
- 必要最小限のコメント

---

**Happy Coding! 🚀**
