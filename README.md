## スクリプト

このプロジェクトでは、以下のyarnスクリプトを使用できます。

- `yarn dev`: 開発サーバーを起動します。
- `yarn build`: 本番環境用のアプリケーションをビルドします。
- `yarn start`: ビルドしたアプリケーションを起動します。
- `yarn lint`: リントツールを実行します。
- `yarn storybook`: Storybookの開発サーバーをポート6006で起動します。
- `yarn build-storybook`: Storybookの静的ファイルをビルドします。
- `yarn format`: Prettierを使用してコードをフォーマットします。`.gitignore`で指定されたファイルを無視し、指定された拡張子のファイルを対象にします。
- `yarn format:check`: Eslint-config-prettierを使用してコードのフォーマットが正しいかチェックします。`src`ディレクトリ以下の指定された拡張子のファイルを対象にします。

## 使用技術

- プログラミング言語: TypeScript
- フレームワーク: React, Next.js
- スタイリング: TailwindCSS, SCSS, Headless UI, Font Awesome
- パッケージマネージャ: yarn
- バージョン管理: Git
- コードフォーマッター: Prettier
- リントツール: ESLint
- CI/CD: GitHub Actions
- データベースマイグレーション: Supabase
- フロントテスト: Storybook
