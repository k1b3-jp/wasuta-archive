# わーすたアーカイブ - 技術仕様書

## 1. プロジェクト概要

### 1.1 プロジェクト名

わーすた（The World Standard）アーカイブ

### 1.2 目的

わーすたのイベント、動画、歴史などのコンテンツをアーカイブし、ファンが閲覧・検索できる Web アプリケーション

### 1.3 バージョン

v0.1.0

## 2. アーキテクチャ

### 2.1 システムアーキテクチャ

```
┌─────────────────────────────────────────────┐
│           クライアント（ブラウザ）              │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│         Next.js アプリケーション                │
│  ┌──────────────────────────────────────┐   │
│  │  Pages Router (SSR/SSG/ISR)          │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  React Components                     │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  API Routes                           │   │
│  └──────────────────────────────────────┘   │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│         Supabase (BaaS)                      │
│  ┌──────────────────────────────────────┐   │
│  │  PostgreSQL Database                  │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  Storage (画像・動画)                  │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  Authentication                       │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 2.2 技術スタック

#### フロントエンド

- **言語**: TypeScript 5.x
- **フレームワーク**:
  - React 18.x
  - Next.js 14.0.4 (Pages Router)
- **スタイリング**:
  - TailwindCSS 3.3.x
  - SCSS/Sass 1.69.x
  - Headless UI 1.7.x
  - Font Awesome 6.7.x
  - Radix UI (Dialog)
  - Lucide React (Icons)
- **UI/UX**:
  - Swiper 11.x (カルーセル)
  - React Lottie Player (アニメーション)
  - React Share (SNS シェア)
  - React Toastify (通知)

#### バックエンド・インフラ

- **BaaS**: Supabase 2.39.x
  - PostgreSQL Database
  - Storage
  - Authentication (Auth UI React)
- **ホスティング**: Vercel (推定)
  - Analytics (@vercel/analytics)
  - Speed Insights (@vercel/speed-insights)
  - OG Image Generation (@vercel/og)

#### 開発ツール

- **パッケージマネージャ**: Yarn 4.1.0
- **Node.js**: 20.10.0 (Volta 管理)
- **リント・フォーマット**: Biome 1.5.3
- **コンポーネント開発**: Storybook 7.6.6
- **バンドル解析**: @next/bundle-analyzer
- **SEO**:
  - next-seo 6.6.0
  - next-sitemap 4.2.3

## 3. ディレクトリ構造

```
wasuta-archive/
├── src/
│   ├── app/               # App Router関連（一部）
│   │   ├── layout.tsx
│   │   └── loading.tsx
│   ├── pages/             # Pages Router（メイン）
│   │   ├── index.tsx      # トップページ
│   │   ├── about.tsx      # アバウト
│   │   ├── form.tsx       # フォーム
│   │   ├── login.tsx      # ログイン
│   │   ├── policy.tsx     # プライバシーポリシー
│   │   ├── terms.tsx      # 利用規約
│   │   ├── 404.tsx        # 404エラー
│   │   ├── _app.tsx       # App wrapper
│   │   ├── events/        # イベント関連
│   │   │   ├── index.tsx          # イベント一覧
│   │   │   ├── history.tsx        # イベント履歴
│   │   │   ├── create.tsx         # イベント作成
│   │   │   └── [id]/
│   │   │       ├── index.tsx      # イベント詳細
│   │   │       ├── edit.tsx       # イベント編集
│   │   │       └── movie.tsx      # イベント動画
│   │   ├── movies/        # 動画関連
│   │   │   └── index.tsx
│   │   ├── exclusive/     # 限定コンテンツ
│   │   │   ├── anniversary-10th.tsx
│   │   │   └── summer-love-tour-2024.tsx
│   │   ├── api/           # API Routes
│   │   │   └── og.tsx     # OG画像生成
│   │   └── sitemap-dynamic.xml.tsx
│   ├── components/        # React コンポーネント
│   │   ├── events/        # イベント関連
│   │   │   ├── EventCard.tsx
│   │   │   ├── MovieCard.tsx
│   │   │   ├── TopFeaturedEventCard.tsx
│   │   │   └── HistoryItem.tsx
│   │   ├── navigation/    # ナビゲーション
│   │   │   ├── NavBar.tsx
│   │   │   ├── BottomBar.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/            # 共通UIコンポーネント
│   │       ├── BaseButton.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── Tag.tsx
│   │       ├── MiniTag.tsx
│   │       ├── CategoryCard.tsx
│   │       ├── ScrollToTopButton.tsx
│   │       ├── Ad.tsx
│   │       └── dialog.tsx
│   ├── contexts/          # React Context
│   │   └── AuthContext.tsx
│   ├── hooks/             # カスタムフック
│   │   ├── useMobile.tsx
│   │   └── useClearQueryParam.ts
│   ├── lib/               # ライブラリ・ユーティリティ
│   │   ├── supabaseClient.ts
│   │   ├── utils.ts
│   │   └── supabase/      # Supabase関連関数
│   │       ├── getEvents.ts
│   │       ├── getEventsByYoutubeLink.ts
│   │       ├── getEventTags.ts
│   │       ├── getMovies.ts
│   │       ├── getYoutubeTags.ts
│   │       ├── createEvent.ts
│   │       ├── createYoutubeLink.ts
│   │       ├── updateEvent.ts
│   │       ├── deleteEvent.ts
│   │       ├── deleteYoutubeLink.ts
│   │       ├── deleteStorage.ts
│   │       └── uploadStorage.ts
│   ├── types/             # TypeScript型定義
│   │   ├── index.d.ts
│   │   ├── event.d.ts
│   │   ├── movie.d.ts
│   │   └── tag.d.ts
│   ├── utils/             # ユーティリティ関数
│   │   └── formatDate.ts
│   ├── styles/            # スタイル
│   └── stories/           # Storybook
├── public/                # 静的ファイル
├── supabase/              # Supabaseマイグレーション
├── schema.ts              # スキーマ定義
├── biome.json             # Biome設定
├── next.config.js         # Next.js設定
├── next-sitemap.config.js # サイトマップ設定
├── tailwind.config.ts     # TailwindCSS設定
├── tsconfig.json          # TypeScript設定
└── package.json
```

## 4. データベース設計

### 4.1 主要テーブル（推定）

#### Events テーブル

イベント情報を管理

- イベント ID
- イベント名
- 開催日
- 説明
- 画像 URL
- タグ
- YouTube 動画リンク
- 作成日時
- 更新日時

#### Movies テーブル

動画情報を管理

- 動画 ID
- タイトル
- YouTube URL
- イベント ID（外部キー）
- タグ
- 作成日時

#### Tags テーブル

タグ情報を管理

- タグ ID
- タグ名
- カテゴリ
- 作成日時

#### YouTube Links テーブル

YouTube 動画とイベントの関連付け

- リンク ID
- イベント ID
- YouTube URL
- 作成日時

### 4.2 ストレージ

Supabase Storage を使用して画像・動画を管理

- イベント画像
- サムネイル
- その他のメディアファイル

## 5. 主要機能

### 5.1 イベント管理

- **イベント一覧表示**: カード形式でイベント表示
- **イベント詳細**: 個別イベントの詳細情報表示
- **イベント作成**: 管理者がイベントを作成
- **イベント編集**: 管理者がイベント情報を編集
- **イベント削除**: 管理者がイベントを削除
- **イベント履歴**: 時系列でイベント表示

### 5.2 動画管理

- **動画一覧表示**: YouTube 動画の一覧表示
- **動画とイベントの紐付け**: イベントに関連する動画の管理
- **動画埋め込み**: YouTube プレイヤーの埋め込み

### 5.3 検索・フィルタリング

- **タグ検索**: タグによるイベント・動画のフィルタリング
- **カテゴリ検索**: カテゴリ別の絞り込み
- **日付検索**: 開催日による検索

### 5.4 認証・認可

- **ログイン**: Supabase Auth による認証
- **管理者機能**:
  - イベント作成・編集・削除
  - コンテンツ管理

### 5.5 限定コンテンツ

- **10 周年記念ページ**: `/exclusive/anniversary-10th`
- **Summer Love Tour 2024**: `/exclusive/summer-love-tour-2024`

### 5.6 SEO・パフォーマンス

- **動的 OG 画像生成**: `/api/og`で OG 画像を動的生成
- **サイトマップ**: 動的サイトマップ生成
- **SSR/SSG**: ページごとに最適なレンダリング手法
- **画像最適化**: browser-image-compression による圧縮
- **Analytics**: Vercel Analytics と Speed Insights

### 5.7 SNS 連携

- **シェア機能**: React Share による各種 SNS シェア
- **埋め込みコンテンツ**: YouTube 動画埋め込み

### 5.8 広告

- **Google 広告**: Ad コンポーネントによる広告表示

## 6. API 設計

### 6.1 API Routes

#### OG 画像生成

- **エンドポイント**: `/api/og`
- **メソッド**: GET
- **機能**: 動的に OG 画像を生成
- **使用ライブラリ**: @vercel/og

### 6.2 Supabase API

#### イベント取得

- `getEvents()`: 全イベント取得
- `getEventsByYoutubeLink()`: YouTube 動画に紐づくイベント取得
- `getEventTags()`: イベントのタグ取得

#### イベント操作

- `createEvent()`: イベント作成
- `updateEvent()`: イベント更新
- `deleteEvent()`: イベント削除

#### 動画取得

- `getMovies()`: 動画一覧取得
- `getYoutubeTags()`: YouTube 動画のタグ取得

#### YouTube リンク操作

- `createYoutubeLink()`: YouTube 動画リンク作成
- `deleteYoutubeLink()`: YouTube 動画リンク削除

#### ストレージ操作

- `uploadStorage()`: ファイルアップロード
- `deleteStorage()`: ファイル削除

## 7. スタイリング戦略

### 7.1 スタイリング手法

- **TailwindCSS**: ユーティリティファースト CSS（主要）
- **SCSS**: カスタムスタイル、複雑なレイアウト
- **CSS Modules**: コンポーネント固有スタイル
- **Headless UI**: アクセシブルな UI コンポーネント

### 7.2 デザインシステム

- **カラーパレット**: TailwindCSS 設定で定義
- **タイポグラフィ**: TailwindCSS とカスタムフォント
- **アイコン**:
  - Font Awesome (主要)
  - Lucide React (補助)
- **レスポンシブ**: モバイルファースト設計

### 7.3 カスタムフック

- **useMobile**: モバイル判定フック
- **useClearQueryParam**: クエリパラメータクリアフック

## 8. セキュリティ

### 8.1 認証

- Supabase Auth による認証
- Auth UI React による認証 UI

### 8.2 認可

- 管理者機能へのアクセス制御
- AuthContext による認証状態管理

### 8.3 データ検証

- TypeScript による型安全性
- Supabase RLS（Row Level Security）による行レベルセキュリティ（推定）

### 8.4 ロールと権限（RLS）

- ロール
  - `public`: 認証なしの一般閲覧者
  - `authenticated`: ログイン済みユーザー（一般権限）
  - `admin`: 管理者（`public.user_roles` テーブルで判定）
- 管理者判定
  - 関数 `public.is_admin(u uuid)` が `public.user_roles(user_id=u, role='admin')` の存在で判定
  - テーブル `public.user_roles` は RLS により本人（`auth.uid()`）のみ参照可能
  - 参照: `supabase/migrations/20251126000100_admin_roles.sql:2-5, 8-19, 22-30`
- テーブル別ポリシー（最新）
  - `public.events`
    - Select: 公開（`events_select_public`）
    - Insert: 認証ユーザー可
    - Update: 認証ユーザー可 / Delete: 管理者のみ
    - 参照: `supabase/migrations/20251126000200_rls_lockdown.sql:41, 78-80`, `supabase/migrations/20251126000900_rls_relax_events_update.sql:1-9`
  - `public.event_tags`
    - Select: 公開
    - Insert: 認証ユーザー可
    - Update: 認証ユーザー可 / Delete: 管理者のみ
    - 参照: `supabase/migrations/20251126000200_rls_lockdown.sql:49, 82-84`, `supabase/migrations/20251126000800_rls_relax_event_tags_insert.sql:1-8`, `supabase/migrations/20251126001000_rls_relax_event_tags_update.sql:1-9`
  - `public.event_youtube_links`
    - Select: 公開
    - Insert: 認証ユーザー可（`event_youtube_links_insert_authenticated`）
    - Update/Delete: 管理者のみ
    - 参照: `supabase/migrations/20251126000200_rls_lockdown.sql:57, 87-88` と `20251126000300_rls_relax_youtube.sql:6, 21-25`
  - `public.youtube_links`
    - Select: 公開
    - Insert: 認証ユーザー可（`youtube_links_insert_authenticated`）
    - Update/Delete: 管理者のみ
    - 参照: `supabase/migrations/20251126000200_rls_lockdown.sql:65, 91-92` と `20251126000300_rls_relax_youtube.sql:4, 9-14`
  - `public.youtube_tags`
    - Select: 公開
    - Insert: 認証ユーザー可（`youtube_tags_insert_authenticated`）
    - Update/Delete: 管理者のみ
    - 参照: `supabase/migrations/20251126000200_rls_lockdown.sql:73, 95-96` と `20251126000300_rls_relax_youtube.sql:5, 15-20`
  - `storage.objects`
    - Insert/Update/Delete: 認証ユーザー可
    - 参照: `supabase/migrations/20251126000200_rls_lockdown.sql:99-101`, `supabase/migrations/20251126000500_rls_relax_storage.sql:1-8`, `supabase/migrations/20251126000700_rls_relax_storage_update_delete.sql:1-16`
- RPC（トランザクション）
  - `public.update_event_tags(p_event_id int, p_tag_ids int[])`: イベントのタグ更新を DELETE+INSERT の単一トランザクションで実施し、部分失敗を防止
  - 参照: `supabase/migrations/20251126000200_update_event_tags.sql:1-17`
- API と権限の対応
  - イベント作成: 認証ユーザー可 / 更新・削除: 管理者のみ（例: `src/pages/api/events/create.ts:10-23`, `src/pages/api/events/update.ts:16-23, 34-40`）
  - YouTube リンク作成: 認証ユーザー（管理者不要）で許可、部分失敗時ロールバック（`src/pages/api/youtube/create.ts:35-56, 97-121`）

## 9. パフォーマンス最適化

### 9.1 画像最適化

- Next.js Image コンポーネント
- browser-image-compression による画像圧縮

### 9.2 コード分割

- Next.js 自動コード分割
- Dynamic Import による遅延ロード

### 9.3 キャッシング

- SWR によるデータフェッチング・キャッシング
- Next.js ISR (Incremental Static Regeneration)

### 9.4 バンドル最適化

- @next/bundle-analyzer によるバンドルサイズ分析

### 9.5 モニタリング

- Vercel Analytics
- Vercel Speed Insights

## 10. デプロイ

### 10.1 ホスティング

- **プラットフォーム**: Vercel（推定）
- **ブランチ戦略**:
  - `main`: 本番環境
  - `develop`: 開発環境（現在のブランチ）

### 10.2 CI/CD

- **GitHub Actions**: 自動化パイプライン
- **ビルドプロセス**:
  1. リント・フォーマットチェック
  2. TypeScript コンパイル
  3. Next.js ビルド
  4. サイトマップ生成
  5. デプロイ

### 10.3 環境変数

- Supabase URL
- Supabase Anon Key
- その他の機密情報

## 11. サードパーティ統合

### 11.1 YouTube

- YouTube Data API（推定）
- YouTube Embed Player

### 11.2 Google Services

- Google 広告
- Google Analytics（推定）

### 11.3 SNS

- Twitter/X
- Facebook
- LINE
- その他の SNS シェア

## 12. ブラウザサポート

- **モダンブラウザ**: Chrome, Firefox, Safari, Edge（最新版）
- **モバイル**: iOS Safari, Android Chrome
- **JavaScript**: ES2020+

## 13. 今後の拡張可能性

### 13.1 機能拡張

- コメント機能
- お気に入り機能
- ユーザープロフィール
- 通知機能
- 高度な検索・フィルタリング

### 13.2 技術的改善

- App Router への完全移行
- PWA 化
- オフライン対応
- パフォーマンスさらなる最適化

### 13.3 コンテンツ拡張

- グッズアーカイブ
- 楽曲データベース
- メンバー情報
- ファンコミュニティ

## 14. 参考リンク

- Next.js: https://nextjs.org/
- React: https://react.dev/
- Supabase: https://supabase.com/
- TailwindCSS: https://tailwindcss.com/
- Biome: https://biomejs.dev/
