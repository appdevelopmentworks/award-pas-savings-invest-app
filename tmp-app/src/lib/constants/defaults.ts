export const SPECIAL_EXPENSE_TEMPLATES = [
  { id: "low", label: "少なめ", annualAmount: 120000, note: "税金や最低限のイベント" },
  { id: "medium", label: "ふつう", annualAmount: 240000, note: "旅行や家電の買い替えも想定" },
  { id: "high", label: "多め", annualAmount: 360000, note: "車検・引っ越しなど大きめ" },
];

export const SPECIAL_EXPENSE_BREAKDOWN_TEMPLATES = [
  { id: "tax", label: "税金・保険の年払い", annualAmount: 60000 },
  { id: "travel", label: "旅行・帰省", annualAmount: 60000 },
  { id: "appliance", label: "家電の買い替え", annualAmount: 30000 },
  { id: "events", label: "冠婚葬祭・お祝い", annualAmount: 30000 },
  { id: "car", label: "車検・メンテ", annualAmount: 60000 },
  { id: "move", label: "引っ越し・家具", annualAmount: 30000 },
];

export const GOAL_OPTIONS = [
  { id: "FIRST_1M", label: "まず100万円" },
  { id: "RETIREMENT", label: "老後資金" },
  { id: "EDUCATION", label: "教育資金" },
  { id: "HOME", label: "住宅" },
  { id: "OTHER", label: "その他" },
];

export const LIFE_EVENT_OPTIONS = [
  { id: "HOUSING", label: "住宅" },
  { id: "EDUCATION", label: "教育" },
  { id: "MARRIAGE", label: "結婚・出産" },
  { id: "CAR", label: "車" },
  { id: "TRAVEL", label: "旅行・留学" },
  { id: "OTHER", label: "その他" },
];

export const HORIZON_OPTIONS = [12, 36, 60, 120];

export const STORAGE_VERSION = "v1";
