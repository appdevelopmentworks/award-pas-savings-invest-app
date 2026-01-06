import { describe, expect, it } from "vitest";
import { computePlan } from "@/lib/calc/plan";
import type { UserInput } from "@/types/models";

const baseInput: UserInput = {
  monthlyNetIncome: 300000,
  monthlyFixedCost: 120000,
  monthlyVariableCost: 100000,
  cashSavings: 500000,
  monthlyDebtPayment: 0,
  annualSpecialExpense: 240000,
  bonus: { hasBonus: false, annualBonusTotal: 0 },
};

describe("computePlan", () => {
  it("calculates surplus and reserves correctly", () => {
    const plan = computePlan(baseInput);
    expect(plan.monthlySurplusBeforeBuffers).toBe(80000);
    expect(plan.monthlySpecialExpenseReserve).toBe(20000);
    expect(plan.monthlySafetyBuffer).toBe(15000);
  });

  it("caps invest amounts at zero when surplus is negative", () => {
    const plan = computePlan({
      ...baseInput,
      monthlyNetIncome: 200000,
      monthlyFixedCost: 160000,
      monthlyVariableCost: 80000,
    });
    expect(plan.monthlySurplusBeforeBuffers).toBeLessThan(0);
    expect(plan.recommendation.safeMonthlyInvest).toBe(0);
    expect(plan.recommendation.growthMonthlyInvest).toBe(0);
    expect(plan.investCap).toBe(0);
  });

  it("rounds down investment to 1000 yen units", () => {
    const plan = computePlan({
      ...baseInput,
      monthlyNetIncome: 400000,
      monthlyFixedCost: 120000,
      monthlyVariableCost: 100000,
      annualSpecialExpense: 0,
      cashSavings: 1000000,
    });
    expect(plan.recommendation.safeMonthlyInvest % 1000).toBe(0);
    expect(plan.recommendation.growthMonthlyInvest % 1000).toBe(0);
  });

  it("keeps invest caps non-negative when special expense is high", () => {
    const plan = computePlan({
      ...baseInput,
      annualSpecialExpense: 1200000,
    });
    expect(plan.investCap).toBeGreaterThanOrEqual(0);
    expect(plan.recommendation.safeMonthlyInvest).toBeGreaterThanOrEqual(0);
  });
});
