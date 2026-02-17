# 家計簿アプリ（Household Account App）

個人開発として制作した、複数通貨対応の家計簿Webアプリです。  
月別・年別レポートや連続収支（定期収支）管理に対応しています。

---

## 概要

このアプリは、日々の収支を簡単に記録し、  
**月次・年次レポートを視覚的に確認できる家計管理ツール**です。

- 複数通貨（JPY / USD / AUD / EUR / GBP / CAD / NZD / PHP など）に対応
- 為替レートを考慮した「全通貨（JPY換算）」表示
- モバイル対応のレスポンシブUI

---

## デモ

### デプロイ先
https://household-app2.vercel.app/

### デモアカウント
Email: kei152133@gmail.com  
Password: Keito1017

※ テスト用アカウントのため、データは定期的にリセットされます。

---

## 主な機能

- ユーザー認証（サインアップ / ログイン）
- カテゴリ管理（追加・編集・非表示）
- 月次カレンダーによる収支登録
- 連続収支（毎月・毎週の定期収支）管理
- 月別 / 年別レポート表示
- 為替レートを用いた通貨換算（全通貨集計）
- モバイル・PC 両対応

---

## 使用技術

### フロントエンド
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts

### バックエンド / インフラ
- Supabase
  - Authentication
  - Database
  - Row Level Security (RLS)
  - Edge Functions / Cron

### 外部API / バッチ処理
- Frankfurter API
  - 為替レート取得用API
  - https://www.frankfurter.app/

- Supabase Edge Functions
  - Frankfurter API から為替レートを取得
  - exchange_rates テーブルへ保存

- Supabase Cron
  - 毎日 0:00 に自動実行
  - 最新為替レートを自動更新

### 為替レート更新設計
- 外部API（Frankfurter）への直接依存を避けるため、
  アプリ側はAPIを直接呼ばず、DBを参照する構成にしています。

- Supabase Edge Function にて為替レートを取得し、
  exchange_rates テーブルへ保存。

- Supabase Cron により毎日 0:00 に自動更新。

この設計により：
- APIダウン時でも既存データで計算可能
- フロントエンドのパフォーマンス向上
- APIコール回数削減

---

## 画面構成

- `/signin` / `/signup`：認証画面
- `/monthly`：月次カレンダー・収支登録
- `/report`：期間指定レポート
- `/yearly`：年次レポート（通貨別 / 全通貨）
- `/mypage`：カテゴリ管理・連続収支・プロフィール

---

## 工夫した点

- **為替レートを考慮した集計ロジック**
  - 外貨はDBの為替テーブルを参照し、JPYに換算して合算
- **ロジックとUIの分離**
  - page / components / hooks に責務を分離
- **UXを意識した操作制限**
  - 編集中は他操作を無効化
  - 削除時は ConfirmDialog を必須化
- **モバイル対応**
  - Tailwind のレスポンシブクラスを活用
- **supabaseによるDBのRLS Policy
  - profiles
    - INSERT : with check (((auth.uid() IS NOT NULL) AND (auth.uid() = id)));
    - SELECT : using ((auth.uid() = id));
    - UPDATE : using ( (auth.uid() = id));
  - transactions
    - INSERT ポリシー : with check(((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)));
    - SELECT ポリシー : using((auth.uid() = user_id));
    - UPDATE ポリシー : using((auth.uid() = user_id));
    - DELETE ポリシー : using( (auth.uid() = user_id));
  -categories
    - insert own categories : with check((auth.uid() = user_id));
    - select own categories : using((auth.uid() = user_id));
    - update own categories : using((auth.uid() = user_id));
    - delete own categories : using((auth.uid() = user_id));
  -exchange_rates
    - exchange_rates_read : using (true);
---

## 今後の改善予定

- グラフ表示のカスタマイズ
- CSVエクスポート機能
- ダークモード対応
- テストコードの追加

---

## セットアップ方法

```bash
# リポジトリをクローン
git clone https://github.com/Keito-1/household-app2.git

# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
