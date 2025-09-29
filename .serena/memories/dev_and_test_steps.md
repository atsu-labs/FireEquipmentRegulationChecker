# 開発・テスト・Lint手順
1. `npm install` で依存パッケージをインストール
2. `npm run dev` で開発サーバ起動
3. コード修正後、`npm run lint` で静的解析
4. `npm run test` でテスト実行
5. 問題なければ `npm run build` で本番ビルド
6. 必要に応じて `npm run lint:fix` で自動修正
7. UI/メッセージ・判定根拠は日本語で統一すること