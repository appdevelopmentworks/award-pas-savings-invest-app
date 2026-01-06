# データモデル（MVP）
作成日: 2026-01-06

## 1) 入力モデル（UserInput）
```json
{
  "monthlyNetIncome": 300000,
  "monthlyFixedCost": 120000,
  "monthlyVariableCost": 100000,
  "cashSavings": 500000,
  "monthlyDebtPayment": 0,
  "annualSpecialExpense": 240000,
  "specialExpenseItems": [
    { "id": "tax", "label": "税金・保険の年払い", "annualAmount": 60000 }
  ],
  "bonus": {
    "hasBonus": true,
    "annualBonusTotal": 600000
  },
  "goals": [
    {
      "id": "goal-1",
      "type": "FIRST_1M",
      "targetAmount": 1000000,
      "horizonMonths": 36
    }
  ],
  "lifeEvents": [
    {
      "id": "event-1",
      "type": "HOUSING",
      "title": "住宅頭金",
      "targetAmount": 3000000,
      "horizonMonths": 60
    }
  ],
  "household": {
    "adults": 1,
    "children": 0
  }
}
```

### バリデーション（例）
- 各金額: 0以上
- 手取り: 50,000〜2,000,000（UIで妥当範囲）
- 支出合計が手取りを大きく超える場合は警告（入力ミス or 赤字生活）

## 2) 出力モデル（PlanOutput）
```json
{
  "monthlySurplusBeforeBuffers": 80000,
  "monthlySpecialExpenseReserve": 20000,
  "monthlySafetyBuffer": 20000,
  "emergencyFundMonths": 3,
  "emergencyFundTarget": 900000,
  "emergencyFundGap": 400000,
  "recommendation": {
    "safeMonthlyInvest": 10000,
    "growthMonthlyInvest": 30000,
    "increaseStep": 5000,
    "increaseEveryMonths": 3
  },
  "explanations": {
    "formula": "余剰=手取り-固定費-変動費-借入",
    "notes": ["安全ラインは“絶対続く”を優先し小さめに提示"]
  },
  "goalProjections": [
    {
      "id": "goal-1",
      "type": "FIRST_1M",
      "horizonMonths": 36,
      "targetAmount": 1000000,
      "safeInvestProjection": 360000,
      "gap": 640000
    }
  ]
}
```

## 3) 永続化（LocalStorage）
- `pasCoach.userInput.v1`
- `pasCoach.planOutput.v1`
- `pasCoach.todos.v1`（checked状態）
- `pasCoach.meta.v1`（updatedAt, version）
