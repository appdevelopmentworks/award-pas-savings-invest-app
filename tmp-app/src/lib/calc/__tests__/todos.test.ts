import { describe, expect, it } from "vitest";
import { computePlan } from "@/lib/calc/plan";
import { computeTodos } from "@/lib/calc/todos";
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

describe("computeTodos", () => {
  it("prioritizes cashflow fix when surplus is negative", () => {
    const input = {
      ...baseInput,
      monthlyNetIncome: 200000,
      monthlyFixedCost: 160000,
      monthlyVariableCost: 80000,
    };
    const plan = computePlan(input);
    const todos = computeTodos(input, plan);
    expect(todos[0].id).toBe("FIX_CASHFLOW");
  });
});
