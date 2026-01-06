import { z } from "zod";
import type { UserInput } from "@/types/models";

const bonusSchema = z
  .object({
    hasBonus: z.boolean(),
    annualBonusTotal: z.number().nonnegative().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.hasBonus && (!value.annualBonusTotal || value.annualBonusTotal <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "賞与がある場合は年間合計を入力してください",
        path: ["annualBonusTotal"],
      });
    }
  });

const goalSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["FIRST_1M", "RETIREMENT", "EDUCATION", "HOME", "OTHER"]),
  label: z.string().optional(),
  targetAmount: z.number().nonnegative().optional(),
  horizonMonths: z.number().int().positive().optional(),
});

const specialExpenseItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  annualAmount: z.number().nonnegative(),
});

const householdSchema = z.object({
  adults: z.number().int().min(1).max(6),
  children: z.number().int().min(0).max(10),
});

const lifeEventSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "HOUSING",
    "EDUCATION",
    "MARRIAGE",
    "CAR",
    "TRAVEL",
    "OTHER",
  ]),
  title: z.string().optional(),
  targetAmount: z.number().nonnegative(),
  horizonMonths: z.number().int().positive(),
});

export const userInputSchema = z
  .object({
    monthlyNetIncome: z.number().min(50000).max(2000000),
    monthlyFixedCost: z.number().nonnegative(),
    monthlyVariableCost: z.number().nonnegative(),
    cashSavings: z.number().nonnegative(),
    monthlyDebtPayment: z.number().nonnegative(),
    annualSpecialExpense: z.number().nonnegative(),
    specialExpenseItems: z.array(specialExpenseItemSchema).optional(),
    bonus: bonusSchema.optional(),
    goals: z.array(goalSchema).max(5).optional(),
    lifeEvents: z.array(lifeEventSchema).max(5).optional(),
    household: householdSchema.optional(),
  })
  .superRefine((value, ctx) => {
    const totalSpend =
      value.monthlyFixedCost + value.monthlyVariableCost + value.monthlyDebtPayment;
    if (totalSpend > value.monthlyNetIncome * 1.2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "支出が手取りを大きく超えています。入力ミスがないか確認してください",
        path: ["monthlyFixedCost"],
      });
    }

    if (value.goals && value.goals.length > 0) {
      value.goals.forEach((goal, index) => {
        if (goal.horizonMonths && goal.horizonMonths < 12) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "目標期間は最低1年（12ヶ月）を推奨します",
            path: ["goals", index, "horizonMonths"],
          });
        }
      });
    }
  });

export type ValidationResult =
  | { success: true; data: UserInput }
  | { success: false; errors: Record<string, string> };

export const validateUserInput = (input: UserInput): ValidationResult => {
  const result = userInputSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const formatted: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const key = issue.path.length > 0 ? issue.path.join(".") : "form";
    if (!formatted[key]) {
      formatted[key] = issue.message;
    }
  });

  return { success: false, errors: formatted };
};
