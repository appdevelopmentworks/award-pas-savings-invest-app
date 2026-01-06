# アーキテクチャ設計（MVP）
作成日: 2026-01-06

## 1) 全体
- Client-side計算（入力→即結果）
- 永続化: localStorage
- 将来: API化（Supabase/Next API Routes）可能な分離設計

## 2) ディレクトリ案（Next.js App Router）
```
src/
  app/
    page.tsx                # LP
    onboarding/page.tsx      # 入力
    result/page.tsx          # 結果
    settings/page.tsx
  components/
    forms/
    cards/
    charts/
    ui/                      # shadcn
  lib/
    calc/                    # ロジック（純関数）
      plan.ts
      todos.ts
      validate.ts
    storage/
      localStorage.ts
    constants/
      labels.ts
      defaults.ts
  store/
    useAppStore.ts           # Zustandなど
  types/
    models.ts
```

## 3) 設計ルール
- 計算は `lib/calc` に純関数として隔離（UIから独立）
- 入力→PlanOutput生成は1関数に集約（再計算/テスト容易）
- localStorage I/O は `lib/storage` に集約
- UIはカード単位で分割（再利用）

## 4) エラーハンドリング
- Zod等で入力検証
- 異常値は “警告カード” を出す（クラッシュさせない）

## 5) 将来拡張
- 認証（メール/Google）
- データ同期（クラウド）
- 口座連携（Open Banking等）※別プロダクト扱いでもOK
