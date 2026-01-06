import type { PlanOutput, UserInput } from "@/types/models";

const roundDown = (value: number, unit: number) =>
  Math.floor(value / unit) * unit;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const computePlan = (input: UserInput): PlanOutput => {
  const monthlyNetIncome = input.monthlyNetIncome || 0;
  const monthlyFixedCost = input.monthlyFixedCost || 0;
  const monthlyVariableCost = input.monthlyVariableCost || 0;
  const monthlyDebtPayment = input.monthlyDebtPayment || 0;
  const annualSpecialExpense = input.annualSpecialExpense || 0;
  const cashSavings = input.cashSavings || 0;
  const householdAdults = input.household?.adults ?? 1;
  const householdChildren = input.household?.children ?? 0;

  const monthlySpecialExpenseReserve = annualSpecialExpense / 12;
  const monthlySurplusBeforeBuffers =
    monthlyNetIncome - monthlyFixedCost - monthlyVariableCost - monthlyDebtPayment;
  const monthlySafetyBuffer = Math.max(Math.round(monthlyNetIncome * 0.05), 10000);

  const emergencyFundMonths =
    householdChildren > 0 || householdAdults >= 2 ? 6 : 3;
  const emergencyFundTarget =
    emergencyFundMonths *
    (monthlyFixedCost + monthlyVariableCost + monthlyDebtPayment);
  const emergencyFundGap = Math.max(0, emergencyFundTarget - cashSavings);

  const usable =
    monthlySurplusBeforeBuffers -
    monthlySpecialExpenseReserve -
    monthlySafetyBuffer;

  let emergencyMonthly = 0;
  let investCap = Math.max(0, usable);

  if (emergencyFundGap > 0 && usable > 0) {
    emergencyMonthly = Math.min(usable * 0.7, emergencyFundGap / 12);
    investCap = Math.max(0, usable - emergencyMonthly);
  }

  let safeMonthlyInvest = roundDown(investCap * 0.35, 1000);
  if (investCap >= 5000) {
    safeMonthlyInvest = Math.max(safeMonthlyInvest, 5000);
  }
  safeMonthlyInvest = clamp(safeMonthlyInvest, 0, investCap);

  let growthMonthlyInvest = roundDown(investCap * 0.8, 1000);
  growthMonthlyInvest = clamp(growthMonthlyInvest, safeMonthlyInvest, investCap);

  const plan: PlanOutput = {
    monthlySurplusBeforeBuffers,
    monthlySpecialExpenseReserve,
    monthlySafetyBuffer,
    emergencyFundMonths,
    emergencyFundTarget,
    emergencyFundGap,
    investCap,
    recommendation: {
      safeMonthlyInvest,
      growthMonthlyInvest,
      increaseStep: 5000,
      increaseEveryMonths: 3,
    },
    explanations: {
      formula: "余剰 = 手取り - 固定費 - 変動費 - 借入",
      notes: [
        "安全ラインは“絶対続く”を優先して小さめに設定",
        "特別費と生活防衛資金を先に確保する考え方",
      ],
    },
  };

  if (monthlySurplusBeforeBuffers < 0) {
    plan.mode = "DEFICIT";
    plan.deficitMonthly = Math.abs(monthlySurplusBeforeBuffers);
  } else {
    plan.mode = "NORMAL";
  }

  if (input.goals && input.goals.length > 0) {
    const bonusAnnual = input.bonus?.hasBonus
      ? input.bonus.annualBonusTotal ?? 0
      : 0;
    const bonusMonthly = bonusAnnual / 12;
    plan.goalProjections = input.goals.map((goal) => {
      const horizonMonths = goal.horizonMonths ?? 36;
      const safeInvestProjection =
        (safeMonthlyInvest + bonusMonthly) * horizonMonths;
      const gap = goal.targetAmount
        ? Math.max(0, goal.targetAmount - safeInvestProjection)
        : undefined;
      return {
        id: goal.id,
        type: goal.type,
        label: goal.label,
        horizonMonths,
        targetAmount: goal.targetAmount,
        safeInvestProjection,
        gap,
      };
    });
  }

  if (input.lifeEvents && input.lifeEvents.length > 0) {
    plan.lifeEventPlans = input.lifeEvents.map((event) => {
      const requiredMonthly =
        event.horizonMonths > 0 ? event.targetAmount / event.horizonMonths : 0;
      const shortfall =
        requiredMonthly > safeMonthlyInvest
          ? requiredMonthly - safeMonthlyInvest
          : undefined;
      return {
        id: event.id,
        type: event.type,
        title: event.title,
        targetAmount: event.targetAmount,
        horizonMonths: event.horizonMonths,
        requiredMonthly,
        shortfall,
      };
    });
  }

  return plan;
};
