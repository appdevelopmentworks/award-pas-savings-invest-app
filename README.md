# AWARD PAS Savings Coach (MVP)

投資未経験〜初心者の会社員向けに、**家計を壊さずに積立投資を「今日から」始めて「続ける」**ための金額設計と行動提案を自動化するWebアプリ。

- コア体験：最小入力（5分） → 「安全な積立額レンジ」＋「今月の最優先ToDo」＋「3ステップ成長計画」
- 設計思想：家計簿（記録）ではなく、**意思決定（次の一手）**を提供する

## MVPスコープ
- 銀行連携なし（手入力）
- データ保存：localStorage（将来はSupabase等へ拡張）
- 投資商品選びは最小（初心者向けの一般的な説明カード・用語ガイド程度）
- アドバイスは「教育目的」＋免責表示（投資助言ではない）

## 実装済み（Phase 1/2）
- 特別費テンプレ強化（内訳入力）
- 赤字改善モード
- 複数目標・ライフイベント試算
- 家族構成を反映した防衛資金目標
- エクスポート/インポート
- 月次リマインド（アプリ内表示）

## 推奨スタック
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand（状態） or React Hook Form（入力） + Zod（バリデーション）
- Chart: Recharts
- Local storage: `zustand/middleware` or 独自hook

## ドキュメント
- docs/requirements.md … 要求定義（MVP）
- docs/ux_ui.md … 画面・コピー・UI構成
- docs/data_model.md … 入力/出力/保存データのスキーマ
- docs/algorithms.md … 計算ロジック（積立可能額レンジ等）
- docs/architecture.md … アーキテクチャ/ファイル構成
- docs/api_spec.md … （将来API化の）インタフェース案
- docs/test_plan.md … テスト観点
- docs/security_privacy.md … プライバシー/セキュリティ/免責
- docs/codex_prompts.md … Codex用バイブコーディングプロンプト集
- docs/roadmap.md … 機能拡張ロードマップ

## 免責
本アプリは一般情報の提供を目的としたもので、投資助言ではありません。最終判断はご自身で行ってください。

## 実行手順
```bash
npm install
npm run dev
```

## テスト
```bash
npm run test
```
