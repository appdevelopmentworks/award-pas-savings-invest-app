# Codex バイブコーディング用プロンプト集
作成日: 2026-01-06

## 0) 使い方（重要）
- このリポジトリ内の docs/*.md を**必ず読み込んでから**実装してください。
- 不明点があれば、まず docs を更新（設計を固める）→ その後実装。
- MVPから逸脱しない（外部API/口座連携/ログイン等は後回し）。

---

## 1) 初回プロンプト（プロジェクト生成）
あなたは熟練のフルスタックエンジニアです。以下の仕様でNext.js(TypeScript)のMVPを生成してください。

### 要求
- docs/requirements.md, docs/ux_ui.md, docs/data_model.md, docs/algorithms.md, docs/architecture.md を読み、仕様に忠実に実装する
- App Routerを使う
- ルーティング: /, /onboarding, /result, /settings
- UI: Tailwind + shadcn/ui で、スマホ優先
- 入力: ステップ式フォーム（5ステップ）
- 計算: `src/lib/calc/plan.ts` に純関数として実装（testsを書ける形）
- 永続化: localStorage（hook or middleware）
- 結果: 安全ライン/成長ライン、3ステップ計画、ToDoカード、説明カード

### 制約
- 投資助言はしない（免責表示）
- 外部APIなし
- 余剰がマイナスの場合は「投資0」＋改善ToDoを出す

出力はコードのみ。完了後、次にやるべきTODOをリスト化。

---

## 2) ロジック実装プロンプト（計算を固める）
`docs/algorithms.md` のルールに従い、以下を実装してください：
- `computePlan(input: UserInput): PlanOutput`
- `computeTodos(input: UserInput, plan: PlanOutput): Todo[]`
- `validateInput(input)`（Zod等）
テストコードも用意してください（vitest/jest どちらでも可）。

---

## 3) UIプロンプト（Resultカード）
`docs/ux_ui.md` を読み、Result画面に以下カードを実装してください：
- Card A: 積立プラン（安全/成長）
- Card B: なぜこの金額？（式と数値）
- Card C: 3ステップ計画
- Card D: 最優先ToDo（チェック保存）
- Card E: 補助ToDo
- Card F: ざっくり見通し（任意）

---

## 4) 仕上げプロンプト（品質）
- 入力のエラーメッセージを初心者向けに改善
- スマホで崩れないように調整
- localStorage破損時に復旧する
- 免責を必ず表示

---

## 5) 追加プロンプト（将来）
- Supabase同期を追加（Phase3）
- 月次レビュー（Phase2）
