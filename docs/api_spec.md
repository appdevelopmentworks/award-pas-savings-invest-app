# API仕様（将来拡張のための叩き台）
作成日: 2026-01-06

MVPはクライアント完結だが、将来サーバー化するためのインタフェース案。

## POST /api/plan
入力を受け取り、PlanOutputを返す。

### Request
- Body: UserInput

### Response
- 200: PlanOutput
- 400: validation errors

## POST /api/feedback
ユーザーが結果に対して「役に立った/立たない」を送る（改善用）。

### Request
```json
{
  "planId": "local-uuid",
  "rating": 1,
  "comment": "積立額が分かって安心した"
}
```
