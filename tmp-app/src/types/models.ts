export type GoalType = "FIRST_1M" | "RETIREMENT" | "EDUCATION" | "HOME" | "OTHER";
export type LifeEventType =
  | "HOUSING"
  | "EDUCATION"
  | "MARRIAGE"
  | "CAR"
  | "TRAVEL"
  | "OTHER";

export type SpecialExpenseItem = {
  id: string;
  label: string;
  annualAmount: number;
};

export type GoalInput = {
  id: string;
  type: GoalType;
  label?: string;
  targetAmount?: number;
  horizonMonths?: number;
};

export type BonusInput = {
  hasBonus: boolean;
  annualBonusTotal?: number;
};

export type HouseholdProfile = {
  adults: number;
  children: number;
};

export type LifeEventInput = {
  id: string;
  type: LifeEventType;
  title?: string;
  targetAmount: number;
  horizonMonths: number;
};

export type ReminderSettings = {
  enabled: boolean;
  dayOfMonth: number;
  lastReviewedAt?: string;
};

export type UserInput = {
  monthlyNetIncome: number;
  monthlyFixedCost: number;
  monthlyVariableCost: number;
  cashSavings: number;
  monthlyDebtPayment: number;
  annualSpecialExpense: number;
  specialExpenseItems?: SpecialExpenseItem[];
  bonus?: BonusInput;
  goals?: GoalInput[];
  lifeEvents?: LifeEventInput[];
  household?: HouseholdProfile;
};

export type PlanRecommendation = {
  safeMonthlyInvest: number;
  growthMonthlyInvest: number;
  increaseStep: number;
  increaseEveryMonths: number;
};

export type PlanExplanation = {
  formula: string;
  notes: string[];
};

export type PlanOutput = {
  monthlySurplusBeforeBuffers: number;
  monthlySpecialExpenseReserve: number;
  monthlySafetyBuffer: number;
  emergencyFundMonths: number;
  emergencyFundTarget: number;
  emergencyFundGap: number;
  investCap: number;
  recommendation: PlanRecommendation;
  explanations: PlanExplanation;
  mode?: "NORMAL" | "DEFICIT";
  deficitMonthly?: number;
  goalProjections?: {
    id: string;
    type: GoalType;
    label?: string;
    horizonMonths: number;
    targetAmount?: number;
    safeInvestProjection: number;
    gap?: number;
  }[];
  lifeEventPlans?: {
    id: string;
    type: LifeEventType;
    title?: string;
    targetAmount: number;
    horizonMonths: number;
    requiredMonthly: number;
    shortfall?: number;
  }[];
};

export type Todo = {
  id: string;
  title: string;
  why: string;
  steps: string[];
};

export type TodoWithStatus = Todo & {
  checked: boolean;
};

export type StorageMeta = {
  updatedAt: string;
  version: string;
};
