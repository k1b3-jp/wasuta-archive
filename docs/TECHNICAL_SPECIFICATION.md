# わーすたアーカイブ - 技術仕様書

## 1. プロジェクト概要

### 1.1 プロジェクト名
わーすた（The World Standard）アーカイブ

### 1.2 目的
わーすたのイベント、動画、歴史などのコンテンツをアーカイブし、ファンが閲覧・検索できるWebアプリケーション

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
  - React Share (SNSシェア)
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
- **Node.js**: 20.10.0 (Volta管理)
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
- イベントID
- イベント名
- 開催日
- 説明
- 画像URL
- タグ
- YouTube動画リンク
- 作成日時
- 更新日時

#### Movies テーブル
動画情報を管理
- 動画ID
- タイトル
- YouTube URL
- イベントID（外部キー）
- タグ
- 作成日時

#### Tags テーブル
タグ情報を管理
- タグID
- タグ名
- カテゴリ
- 作成日時

#### YouTube Links テーブル
YouTube動画とイベントの関連付け
- リンクID
- イベントID
- YouTube URL
- 作成日時

### 4.2 ストレージ
Supabase Storageを使用して画像・動画を管理
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
- **動画一覧表示**: YouTube動画の一覧表示
- **動画とイベントの紐付け**: イベントに関連する動画の管理
- **動画埋め込み**: YouTubeプレイヤーの埋め込み

### 5.3 検索・フィルタリング
- **タグ検索**: タグによるイベント・動画のフィルタリング
- **カテゴリ検索**: カテゴリ別の絞り込み
- **日付検索**: 開催日による検索

### 5.4 認証・認可
- **ログイン**: Supabase Authによる認証
- **管理者機能**: 
  - イベント作成・編集・削除
  - コンテンツ管理

### 5.5 限定コンテンツ
- **10周年記念ページ**: `/exclusive/anniversary-10th`
- **Summer Love Tour 2024**: `/exclusive/summer-love-tour-2024`

### 5.6 SEO・パフォーマンス
- **動的OG画像生成**: `/api/og`でOG画像を動的生成
- **サイトマップ**: 動的サイトマップ生成
- **SSR/SSG**: ページごとに最適なレンダリング手法
- **画像最適化**: browser-image-compressionによる圧縮
- **Analytics**: Vercel AnalyticsとSpeed Insights

### 5.7 SNS連携
- **シェア機能**: React Shareによる各種SNSシェア
- **埋め込みコンテンツ**: YouTube動画埋め込み

### 5.8 広告
- **Google広告**: Ad コンポーネントによる広告表示

## 6. API設計

### 6.1 API Routes

#### OG画像生成
- **エンドポイント**: `/api/og`
- **メソッド**: GET
- **機能**: 動的にOG画像を生成
- **使用ライブラリ**: @vercel/og

### 6.2 Supabase API

#### イベント取得
- `getEvents()`: 全イベント取得
- `getEventsByYoutubeLink()`: YouTube動画に紐づくイベント取得
- `getEventTags()`: イベントのタグ取得

#### イベント操作
- `createEvent()`: イベント作成
- `updateEvent()`: イベント更新
- `deleteEvent()`: イベント削除

#### 動画取得
- `getMovies()`: 動画一覧取得
- `getYoutubeTags()`: YouTube動画のタグ取得

#### YouTube リンク操作
- `createYoutubeLink()`: YouTube動画リンク作成
- `deleteYoutubeLink()`: YouTube動画リンク削除

#### ストレージ操作
- `uploadStorage()`: ファイルアップロード
- `deleteStorage()`: ファイル削除

## 7. スタイリング戦略

### 7.1 スタイリング手法
- **TailwindCSS**: ユーティリティファーストCSS（主要）
- **SCSS**: カスタムスタイル、複雑なレイアウト
- **CSS Modules**: コンポーネント固有スタイル
- **Headless UI**: アクセシブルなUIコンポーネント

### 7.2 デザインシステム
- **カラーパレット**: TailwindCSS設定で定義
- **タイポグラフィ**: TailwindCSSとカスタムフォント
- **アイコン**: 
  - Font Awesome (主要)
  - Lucide React (補助)
- **レスポンシブ**: モバイルファースト設計

### 7.3 カスタムフック
- **useMobile**: モバイル判定フック
- **useClearQueryParam**: クエリパラメータクリアフック

## 8. セキュリティ

### 8.1 認証
- Supabase Authによる認証
- Auth UI Reactによる認証UI

### 8.2 認可
- 管理者機能へのアクセス制御
- AuthContextによる認証状態管理

### 8.3 データ検証
- TypeScriptによる型安全性
- Supabase RLS（Row Level Security）による行レベルセキュリティ（推定）

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
  2. TypeScriptコンパイル
  3. Next.jsビルド
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
- Google広告
- Google Analytics（推定）

### 11.3 SNS
- Twitter/X
- Facebook
- LINE
- その他のSNSシェア

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
