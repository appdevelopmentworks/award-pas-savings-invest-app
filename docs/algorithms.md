# 計算ロジック（MVP）
作成日: 2026-01-06

## 0) 方針
初心者の継続が最優先。数字は「断定」ではなく「目安」として提示。
投資配分最適化ではなく、**積立額の安全設計**にフォーカス。

---

## 1) 基本変数
- I: 月手取り
- F: 固定費（月）
- V: 変動費（月）
- D: 借入返済（月）
- S_annual: 特別費（年）
- S = S_annual / 12（特別費の月割り）
- Cash: 現金残高

## 2) 月次余剰
`surplus = I - F - V - D`

- surplus < 0 の場合：
  - 投資開始より「支出/収入改善」ToDoを最優先に出す
  - 投資の推奨額は0にする（安全）

## 3) 月次安全バッファ
初心者向けは固定的な“予備費”を確保。
`buffer = max(0.05 * I, 10000)` のように最小1万円、手取りの5%を目安に。

## 4) 生活防衛資金ターゲット
会社員向けに保守的に
`emergencyTarget = 3 * (F + V + D)`（まず3ヶ月分）
※将来: 家族/扶養ありなら6ヶ月等に拡張

`emergencyGap = max(0, emergencyTarget - Cash)`

## 5) “投資に回してよい上限”の算出
まず特別費とバッファを先取りし、さらに防衛資金不足があれば優先して積み増す。

- まず使える余剰：
`usable = surplus - S - buffer`

- emergencyGap > 0 の場合（防衛資金不足）：
  - “守りの積み増し”の月額を
    `emergencyMonthly = min(usable * 0.7, emergencyGap / 12)` のように設定（最大1年で埋める想定）
  - 投資上限：
    `investCap = max(0, usable - emergencyMonthly)`
- emergencyGap == 0 の場合：
  - `investCap = max(0, usable)`

## 6) 安全ライン / 成長ライン
- 安全ライン（safeInvest）：心理的に続く小さめ
  - `safeInvest = clamp(round_down(investCap * 0.35, 1000), 0, investCap)`
  - 最低は 5,000円（investCapが十分ある場合のみ）

- 成長ライン（growthInvest）：上限寄り
  - `growthInvest = clamp(round_down(investCap * 0.8, 1000), safeInvest, investCap)`

※ round_down(x, 1000) は 1000円単位で切り下げ

## 7) 段階増額ルール（初心者向け）
- increaseStep = 5000
- increaseEveryMonths = 3
- 成長ラインに達するまで 3ヶ月ごとに+5,000 の提案

## 8) ToDo ルール（優先順位）
優先度:
1. surplus < 0 → 「支出見直し/収入改善」
2. emergencyGap > 0 → 「防衛資金づくり」
3. Sが未設定/低すぎ → 「特別費の先取り」
4. 口座未開設 → 「口座開設→自動引落設定」
5. 習慣化 → 「積立日・金額の固定」

ToDoは最大4つ、うち最優先は1つ必ず表示。

## 9) 目標（任意）シミュレーション（簡易）
- 期待リターンを固定で仮定せず、まずは単純積立で表示：
  - `future = safeInvest * horizonMonths + bonusInvestTotal`
- 追加で「年率3%/5%/7%の目安」タブを用意しても良い（断定しない）
