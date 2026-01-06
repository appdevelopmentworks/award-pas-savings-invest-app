"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { computePlan } from "@/lib/calc/plan";
import { computeTodos } from "@/lib/calc/todos";
import { validateUserInput } from "@/lib/calc/validate";
import {
  loadTodos,
  loadUserInput,
  saveMeta,
  savePlanOutput,
  saveTodos,
  saveUserInput,
} from "@/lib/storage/localStorage";
import {
  GOAL_OPTIONS,
  HORIZON_OPTIONS,
  LIFE_EVENT_OPTIONS,
  SPECIAL_EXPENSE_BREAKDOWN_TEMPLATES,
  SPECIAL_EXPENSE_TEMPLATES,
  STORAGE_VERSION,
} from "@/lib/constants/defaults";
import { Button } from "@/components/ui/button";
import type {
  GoalType,
  LifeEventType,
  TodoWithStatus,
  UserInput,
} from "@/types/models";

const stepLabels = [
  "収入",
  "支出",
  "守り",
  "特別費",
  "家族構成",
  "目標・イベント（任意）",
];

const createId = () =>
  `id-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`;

const createGoal = () => ({
  id: createId(),
  type: "FIRST_1M" as GoalType,
  targetAmount: 1000000,
  horizonMonths: 36,
});

const normalizeGoal = (goal: Partial<ReturnType<typeof createGoal>>) => ({
  id: goal.id ?? createId(),
  type: goal.type ?? ("FIRST_1M" as GoalType),
  label: goal.label ?? "",
  targetAmount: goal.targetAmount,
  horizonMonths: goal.horizonMonths ?? 36,
});

const createLifeEvent = () => ({
  id: createId(),
  type: "HOUSING" as LifeEventType,
  title: "",
  targetAmount: 3000000,
  horizonMonths: 60,
});

const normalizeLifeEvent = (
  event: Partial<ReturnType<typeof createLifeEvent>>
) => ({
  id: event.id ?? createId(),
  type: event.type ?? ("HOUSING" as LifeEventType),
  title: event.title ?? "",
  targetAmount: event.targetAmount ?? 3000000,
  horizonMonths: event.horizonMonths ?? 60,
});

const defaultInput: UserInput = {
  monthlyNetIncome: 0,
  monthlyFixedCost: 0,
  monthlyVariableCost: 0,
  cashSavings: 0,
  monthlyDebtPayment: 0,
  annualSpecialExpense: 240000,
  household: { adults: 1, children: 0 },
  bonus: { hasBonus: false, annualBonusTotal: 0 },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<UserInput>(defaultInput);
  const [goalEnabled, setGoalEnabled] = useState(false);
  const [lifeEventsEnabled, setLifeEventsEnabled] = useState(false);
  const [bonusEnabled, setBonusEnabled] = useState(false);
  const [specialTemplate, setSpecialTemplate] = useState("medium");
  const [breakdownEnabled, setBreakdownEnabled] = useState(false);
  const [specialItems, setSpecialItems] = useState(
    SPECIAL_EXPENSE_BREAKDOWN_TEMPLATES.map((item) => ({
      ...item,
      selected: true,
    }))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const saved = loadUserInput();
    if (saved) {
      const legacyGoal = (saved as UserInput & { goal?: Partial<UserInput["goals"][number]> })
        .goal;
      const normalizedGoals = saved.goals
        ? saved.goals.map((goal) => normalizeGoal(goal))
        : legacyGoal
          ? [normalizeGoal(legacyGoal)]
          : undefined;
      const normalizedLifeEvents = saved.lifeEvents
        ? saved.lifeEvents.map((event) => normalizeLifeEvent(event))
        : undefined;
      const merged: UserInput = {
        ...defaultInput,
        ...saved,
        goals: normalizedGoals,
        lifeEvents: normalizedLifeEvents,
        household: saved.household ?? defaultInput.household,
      };
      setInput(merged);
      setBonusEnabled(Boolean(merged.bonus?.hasBonus));
      setGoalEnabled(Boolean(merged.goals && merged.goals.length > 0));
      setLifeEventsEnabled(Boolean(merged.lifeEvents && merged.lifeEvents.length > 0));
      setRestored(true);

      if (merged.specialExpenseItems && merged.specialExpenseItems.length > 0) {
        setBreakdownEnabled(true);
        const mergedItems = SPECIAL_EXPENSE_BREAKDOWN_TEMPLATES.map((item) => {
          const matched = merged.specialExpenseItems?.find(
            (savedItem) => savedItem.id === item.id
          );
          if (!matched) {
            return { ...item, selected: false };
          }
          return { ...item, annualAmount: matched.annualAmount, selected: true };
        });
        setSpecialItems(mergedItems);
        setSpecialTemplate("breakdown");
      } else {
        const templateMatch = SPECIAL_EXPENSE_TEMPLATES.find(
          (template) => template.annualAmount === saved.annualSpecialExpense
        );
        if (templateMatch) {
          setSpecialTemplate(templateMatch.id);
        } else {
          setSpecialTemplate("custom");
        }
      }
    }
  }, []);

  const stepErrorFields = useMemo(
    () => [
      ["monthlyNetIncome", "bonus", "annualBonusTotal"],
      ["monthlyFixedCost", "monthlyVariableCost"],
      ["cashSavings", "monthlyDebtPayment"],
      ["annualSpecialExpense", "specialExpenseItems"],
      ["household"],
      ["goals", "lifeEvents"],
    ],
    []
  );

  const handleNumberChange = (field: keyof UserInput, value: number) => {
    setInput((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyBreakdownItems = (
    nextItems: { id: string; label: string; annualAmount: number; selected: boolean }[]
  ) => {
    setSpecialItems(nextItems);
    const selectedItems = nextItems
      .filter((item) => item.selected)
      .map(({ id, label, annualAmount }) => ({ id, label, annualAmount }));
    const total = selectedItems.reduce((sum, item) => sum + item.annualAmount, 0);
    setInput((prev) => ({
      ...prev,
      annualSpecialExpense: total,
      specialExpenseItems: selectedItems.length > 0 ? selectedItems : undefined,
    }));
  };

  const handleBreakdownToggle = (checked: boolean) => {
    setBreakdownEnabled(checked);
    if (checked) {
      const nextItems =
        specialItems.length > 0
          ? specialItems
          : SPECIAL_EXPENSE_BREAKDOWN_TEMPLATES.map((item) => ({
              ...item,
              selected: true,
            }));
      applyBreakdownItems(nextItems);
      setSpecialTemplate("breakdown");
    } else {
      setInput((prev) => ({
        ...prev,
        specialExpenseItems: undefined,
      }));
      setSpecialTemplate("custom");
    }
  };

  const handleBonusToggle = (checked: boolean) => {
    setBonusEnabled(checked);
    setInput((prev) => ({
      ...prev,
      bonus: {
        hasBonus: checked,
        annualBonusTotal: checked
          ? prev.bonus?.annualBonusTotal ?? 0
          : 0,
      },
    }));
  };

  const handleGoalToggle = (checked: boolean) => {
    setGoalEnabled(checked);
    setInput((prev) => ({
      ...prev,
      goals: checked ? prev.goals ?? [createGoal()] : undefined,
    }));
  };

  const handleGoalTypeChange = (goalId: string, value: GoalType) => {
    setInput((prev) => ({
      ...prev,
      goals: (prev.goals ?? []).map((goal) =>
        goal.id === goalId ? { ...goal, type: value } : goal
      ),
    }));
  };

  const handleGoalFieldChange = (
    goalId: string,
    field: "targetAmount" | "horizonMonths" | "label",
    value: number | string
  ) => {
    setInput((prev) => ({
      ...prev,
      goals: (prev.goals ?? []).map((goal) =>
        goal.id === goalId ? { ...goal, [field]: value } : goal
      ),
    }));
  };

  const handleTemplateSelect = (templateId: string, amount: number) => {
    setBreakdownEnabled(false);
    setSpecialTemplate(templateId);
    handleNumberChange("annualSpecialExpense", amount);
    setInput((prev) => ({
      ...prev,
      specialExpenseItems: undefined,
    }));
  };

  const handleAddGoal = () => {
    setInput((prev) => ({
      ...prev,
      goals: [...(prev.goals ?? []), createGoal()],
    }));
  };

  const handleRemoveGoal = (goalId: string) => {
    setInput((prev) => ({
      ...prev,
      goals: (prev.goals ?? []).filter((goal) => goal.id !== goalId),
    }));
  };

  const handleLifeEventsToggle = (checked: boolean) => {
    setLifeEventsEnabled(checked);
    setInput((prev) => ({
      ...prev,
      lifeEvents: checked ? prev.lifeEvents ?? [createLifeEvent()] : undefined,
    }));
  };

  const handleAddLifeEvent = () => {
    setInput((prev) => ({
      ...prev,
      lifeEvents: [...(prev.lifeEvents ?? []), createLifeEvent()],
    }));
  };

  const handleRemoveLifeEvent = (eventId: string) => {
    setInput((prev) => ({
      ...prev,
      lifeEvents: (prev.lifeEvents ?? []).filter((event) => event.id !== eventId),
    }));
  };

  const handleLifeEventChange = (
    eventId: string,
    field: "type" | "title" | "targetAmount" | "horizonMonths",
    value: string | number
  ) => {
    setInput((prev) => ({
      ...prev,
      lifeEvents: (prev.lifeEvents ?? []).map((event) =>
        event.id === eventId ? { ...event, [field]: value } : event
      ),
    }));
  };

  const validateStep = () => {
    const result = validateUserInput({
      ...input,
      goals: goalEnabled ? input.goals : undefined,
      lifeEvents: lifeEventsEnabled ? input.lifeEvents : undefined,
    });

    if (result.success) {
      setErrors({});
      return true;
    }

    const allowedFields = stepErrorFields[step] || [];
    const filtered: Record<string, string> = {};
    Object.entries(result.errors).forEach(([field, message]) => {
      const matched = allowedFields.some(
        (allowed) => field === allowed || field.startsWith(`${allowed}.`)
      );
      if (matched) {
        filtered[field] = message;
      }
    });

    if (Object.keys(filtered).length > 0) {
      setErrors(filtered);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((prev) => Math.min(prev + 1, stepLabels.length - 1));
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    const result = validateUserInput({
      ...input,
      goals: goalEnabled ? input.goals : undefined,
      lifeEvents: lifeEventsEnabled ? input.lifeEvents : undefined,
    });

    if (!result.success) {
      setErrors(result.errors);
      return;
    }

    const plan = computePlan(result.data);
    const todos = computeTodos(result.data, plan);
    const existingTodos = loadTodos() ?? [];

    const withStatus: TodoWithStatus[] = todos.map((todo) => {
      const existing = existingTodos.find((item) => item.id === todo.id);
      return {
        ...todo,
        checked: existing ? existing.checked : false,
      };
    });

    saveUserInput(result.data);
    savePlanOutput(plan);
    saveTodos(withStatus);
    saveMeta({
      updatedAt: new Date().toISOString(),
      version: STORAGE_VERSION,
    });

    router.push("/result");
  };

  return (
    <div className="relative min-h-screen px-6 pb-20 pt-8">
      <div className="pointer-events-none absolute -right-32 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(11,122,111,0.18)_0%,_rgba(11,122,111,0)_70%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[320px] w-full opacity-40 grid-mask" />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            PAS Coach
          </p>
          <h1 className="mt-3 text-3xl font-semibold">5分でできる入力フォーム</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            ざっくりでOK。あとでいつでも修正できます。
          </p>
        </div>
        <Button asChild size="sm" variant="secondary" className="hidden md:inline-flex">
          <a href="/">LPへ戻る</a>
        </Button>
      </header>

      <section className="mx-auto mt-10 w-full max-w-5xl">
        <div className="flex items-center justify-between text-sm text-[var(--muted)]">
          <span>
            Step {step + 1} / {stepLabels.length}
          </span>
          <span>{stepLabels[step]}</span>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-[var(--surface-strong)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: `${((step + 1) / stepLabels.length) * 100}%` }}
          />
        </div>
      </section>

      <section className="mx-auto mt-8 w-full max-w-5xl rounded-3xl border border-[rgba(14,31,26,0.08)] bg-white/80 p-8 shadow-soft">
        {restored && (
          <p className="mb-6 rounded-2xl border border-[rgba(14,31,26,0.08)] bg-[var(--surface-strong)] px-4 py-3 text-xs text-[var(--muted)]">
            以前の入力を復元しました。必要なら更新してください。
          </p>
        )}

        {step === 0 && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold" htmlFor="monthlyNetIncome">
                手取り（月）
              </label>
              <p className="text-xs text-[var(--muted)]">
                振込後に自由に使える額（税・社保控除後）
              </p>
              <input
                id="monthlyNetIncome"
                type="number"
                inputMode="numeric"
                className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3 text-base"
                value={input.monthlyNetIncome}
                onChange={(event) =>
                  handleNumberChange("monthlyNetIncome", Number(event.target.value))
                }
              />
              {errors.monthlyNetIncome && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.monthlyNetIncome}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-[rgba(14,31,26,0.08)] bg-[var(--surface-strong)] px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">賞与を入力する</p>
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={bonusEnabled}
                  onChange={(event) => handleBonusToggle(event.target.checked)}
                />
              </div>
              {bonusEnabled && (
                <div className="mt-4">
                  <label
                    className="text-sm font-semibold"
                    htmlFor="annualBonusTotal"
                  >
                    年間の賞与合計
                  </label>
                  <input
                    id="annualBonusTotal"
                    type="number"
                    inputMode="numeric"
                    className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3"
                    value={input.bonus?.annualBonusTotal ?? 0}
                    onChange={(event) =>
                      setInput((prev) => ({
                        ...prev,
                        bonus: {
                          hasBonus: true,
                          annualBonusTotal: Number(event.target.value),
                        },
                      }))
                    }
                  />
                  {errors.annualBonusTotal && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.annualBonusTotal}
                    </p>
                  )}
                  {!errors.annualBonusTotal && errors["bonus.annualBonusTotal"] && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors["bonus.annualBonusTotal"]}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold" htmlFor="monthlyFixedCost">
                固定費（月）
              </label>
              <p className="text-xs text-[var(--muted)]">
                家賃・通信・保険など、毎月ほぼ変わらない支出
              </p>
              <input
                id="monthlyFixedCost"
                type="number"
                inputMode="numeric"
                className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3"
                value={input.monthlyFixedCost}
                onChange={(event) =>
                  handleNumberChange("monthlyFixedCost", Number(event.target.value))
                }
              />
              {errors.monthlyFixedCost && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.monthlyFixedCost}
                </p>
              )}
            </div>
            <div>
              <label
                className="text-sm font-semibold"
                htmlFor="monthlyVariableCost"
              >
                変動費（月）
              </label>
              <p className="text-xs text-[var(--muted)]">
                食費・日用品・交際費など
              </p>
              <input
                id="monthlyVariableCost"
                type="number"
                inputMode="numeric"
                className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3"
                value={input.monthlyVariableCost}
                onChange={(event) =>
                  handleNumberChange(
                    "monthlyVariableCost",
                    Number(event.target.value)
                  )
                }
              />
              {errors.monthlyVariableCost && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.monthlyVariableCost}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold" htmlFor="cashSavings">
                現金残高（貯金）
              </label>
              <p className="text-xs text-[var(--muted)]">
                すぐ使える現金・普通預金の合計
              </p>
              <input
                id="cashSavings"
                type="number"
                inputMode="numeric"
                className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3"
                value={input.cashSavings}
                onChange={(event) =>
                  handleNumberChange("cashSavings", Number(event.target.value))
                }
              />
              {errors.cashSavings && (
                <p className="mt-2 text-xs text-red-600">{errors.cashSavings}</p>
              )}
            </div>
            <div>
              <label
                className="text-sm font-semibold"
                htmlFor="monthlyDebtPayment"
              >
                借入返済（月）
              </label>
              <p className="text-xs text-[var(--muted)]">0円でもOK</p>
              <input
                id="monthlyDebtPayment"
                type="number"
                inputMode="numeric"
                className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3"
                value={input.monthlyDebtPayment}
                onChange={(event) =>
                  handleNumberChange(
                    "monthlyDebtPayment",
                    Number(event.target.value)
                  )
                }
              />
              {errors.monthlyDebtPayment && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.monthlyDebtPayment}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold">特別費（年）</p>
              <p className="text-xs text-[var(--muted)]">
                税・旅行・家電など年に数回の大きめ支出
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(14,31,26,0.08)] bg-[var(--surface-strong)] px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">内訳で入力する</p>
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={breakdownEnabled}
                  onChange={(event) => handleBreakdownToggle(event.target.checked)}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                税・旅行などの内訳から合計を自動計算します。
              </p>
            </div>

            {breakdownEnabled ? (
              <div className="space-y-3">
                {specialItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(14,31,26,0.12)] bg-white/70 px-4 py-3"
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={item.selected}
                        onChange={(event) => {
                          const nextItems = specialItems.map((row) =>
                            row.id === item.id
                              ? { ...row, selected: event.target.checked }
                              : row
                          );
                          applyBreakdownItems(nextItems);
                        }}
                      />
                      {item.label}
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      className="w-32 rounded-2xl border border-[rgba(14,31,26,0.15)] px-3 py-2 text-sm"
                      value={item.annualAmount}
                      disabled={!item.selected}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        const nextItems = specialItems.map((row) =>
                          row.id === item.id
                            ? { ...row, annualAmount: value }
                            : row
                        );
                        applyBreakdownItems(nextItems);
                      }}
                    />
                  </div>
                ))}
                <p className="text-xs text-[var(--muted)]">
                  合計: ¥{input.annualSpecialExpense.toLocaleString()}
                </p>
              </div>
            ) : (
              <>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {SPECIAL_EXPENSE_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        specialTemplate === template.id
                          ? "border-[var(--accent)] bg-white"
                          : "border-[rgba(14,31,26,0.12)] bg-white/70"
                      }`}
                      onClick={() =>
                        handleTemplateSelect(template.id, template.annualAmount)
                      }
                    >
                      <p className="text-sm font-semibold">{template.label}</p>
                      <p className="mt-2 text-xs text-[var(--muted)]">
                        {template.note}
                      </p>
                      <p className="mt-2 text-base font-semibold">
                        ¥{template.annualAmount.toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
                <div>
                  <label
                    className="text-sm font-semibold"
                    htmlFor="annualSpecialExpense"
                  >
                    カスタムで入力する
                  </label>
                  <input
                    id="annualSpecialExpense"
                    type="number"
                    inputMode="numeric"
                    className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3"
                    value={input.annualSpecialExpense}
                    onChange={(event) => {
                      setSpecialTemplate("custom");
                      handleNumberChange(
                        "annualSpecialExpense",
                        Number(event.target.value)
                      );
                    }}
                  />
                  {errors.annualSpecialExpense && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.annualSpecialExpense}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[rgba(14,31,26,0.08)] bg-[var(--surface-strong)] px-4 py-4">
              <h2 className="text-sm font-semibold">家族構成</h2>
              <p className="mt-2 text-xs text-[var(--muted)]">
                扶養がある場合は防衛資金の目標月数を増やします。
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold" htmlFor="householdAdults">
                    大人の人数
                  </label>
                  <input
                    id="householdAdults"
                    type="number"
                    inputMode="numeric"
                    className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3"
                    value={input.household?.adults ?? 1}
                    min={1}
                    onChange={(event) =>
                      setInput((prev) => ({
                        ...prev,
                        household: {
                          adults: Math.max(1, Number(event.target.value)),
                          children: prev.household?.children ?? 0,
                        },
                      }))
                    }
                  />
                  {errors["household.adults"] && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors["household.adults"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold" htmlFor="householdChildren">
                    子どもの人数
                  </label>
                  <input
                    id="householdChildren"
                    type="number"
                    inputMode="numeric"
                    className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3"
                    value={input.household?.children ?? 0}
                    min={0}
                    onChange={(event) =>
                      setInput((prev) => ({
                        ...prev,
                        household: {
                          adults: prev.household?.adults ?? 1,
                          children: Math.max(0, Number(event.target.value)),
                        },
                      }))
                    }
                  />
                  {errors["household.children"] && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors["household.children"]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[rgba(14,31,26,0.08)] bg-[var(--surface-strong)] px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">目標を入力する</p>
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={goalEnabled}
                  onChange={(event) => handleGoalToggle(event.target.checked)}
                />
              </div>
              {goalEnabled && (
                <div className="mt-4 space-y-6">
                  {(input.goals ?? []).map((goal, index) => (
                    <div
                      key={goal.id}
                      className="rounded-2xl border border-[rgba(14,31,26,0.12)] bg-white/70 px-4 py-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">目標 {index + 1}</p>
                        {index > 0 && (
                          <button
                            type="button"
                            className="text-xs text-[var(--muted)]"
                            onClick={() => handleRemoveGoal(goal.id)}
                          >
                            削除
                          </button>
                        )}
                      </div>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label
                            className="text-sm font-semibold"
                            htmlFor={`goalLabel-${goal.id}`}
                          >
                            メモ（任意）
                          </label>
                          <input
                            id={`goalLabel-${goal.id}`}
                            type="text"
                            className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3"
                            value={goal.label ?? ""}
                            onChange={(event) =>
                              handleGoalFieldChange(goal.id, "label", event.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold" htmlFor={`goalType-${goal.id}`}>
                            目的
                          </label>
                          <select
                            id={`goalType-${goal.id}`}
                            className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3"
                            value={goal.type}
                            onChange={(event) =>
                              handleGoalTypeChange(goal.id, event.target.value as GoalType)
                            }
                          >
                            {GOAL_OPTIONS.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            className="text-sm font-semibold"
                            htmlFor={`goalHorizon-${goal.id}`}
                          >
                            期間
                          </label>
                          <select
                            id={`goalHorizon-${goal.id}`}
                            className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3"
                            value={goal.horizonMonths ?? 36}
                            onChange={(event) =>
                              handleGoalFieldChange(
                                goal.id,
                                "horizonMonths",
                                Number(event.target.value)
                              )
                            }
                          >
                            {HORIZON_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option / 12}年
                              </option>
                            ))}
                          </select>
                          {errors[`goals.${index}.horizonMonths`] && (
                            <p className="mt-2 text-xs text-red-600">
                              {errors[`goals.${index}.horizonMonths`]}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            className="text-sm font-semibold"
                            htmlFor={`goalAmount-${goal.id}`}
                          >
                            目標金額（任意）
                          </label>
                          <input
                            id={`goalAmount-${goal.id}`}
                            type="number"
                            inputMode="numeric"
                            className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3"
                            value={goal.targetAmount ?? 0}
                            onChange={(event) =>
                              handleGoalFieldChange(
                                goal.id,
                                "targetAmount",
                                Number(event.target.value)
                              )
                            }
                          />
                          {errors[`goals.${index}.targetAmount`] && (
                            <p className="mt-2 text-xs text-red-600">
                              {errors[`goals.${index}.targetAmount`]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddGoal}>
                    目標を追加
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[rgba(14,31,26,0.08)] bg-[var(--surface-strong)] px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">ライフイベントを入力する</p>
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={lifeEventsEnabled}
                  onChange={(event) => handleLifeEventsToggle(event.target.checked)}
                />
              </div>
              {lifeEventsEnabled && (
                <div className="mt-4 space-y-6">
                  {(input.lifeEvents ?? []).map((event, index) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-[rgba(14,31,26,0.12)] bg-white/70 px-4 py-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">イベント {index + 1}</p>
                        {index > 0 && (
                          <button
                            type="button"
                            className="text-xs text-[var(--muted)]"
                            onClick={() => handleRemoveLifeEvent(event.id)}
                          >
                            削除
                          </button>
                        )}
                      </div>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label
                            className="text-sm font-semibold"
                            htmlFor={`eventTitle-${event.id}`}
                          >
                            メモ（任意）
                          </label>
                          <input
                            id={`eventTitle-${event.id}`}
                            type="text"
                            className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3"
                            value={event.title ?? ""}
                            onChange={(eventInput) =>
                              handleLifeEventChange(event.id, "title", eventInput.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold" htmlFor={`eventType-${event.id}`}>
                            種類
                          </label>
                          <select
                            id={`eventType-${event.id}`}
                            className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3"
                            value={event.type}
                            onChange={(eventInput) =>
                              handleLifeEventChange(
                                event.id,
                                "type",
                                eventInput.target.value as LifeEventType
                              )
                            }
                          >
                            {LIFE_EVENT_OPTIONS.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            className="text-sm font-semibold"
                            htmlFor={`eventHorizon-${event.id}`}
                          >
                            期間
                          </label>
                          <select
                            id={`eventHorizon-${event.id}`}
                            className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3"
                            value={event.horizonMonths}
                            onChange={(eventInput) =>
                              handleLifeEventChange(
                                event.id,
                                "horizonMonths",
                                Number(eventInput.target.value)
                              )
                            }
                          >
                            {HORIZON_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option / 12}年
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            className="text-sm font-semibold"
                            htmlFor={`eventAmount-${event.id}`}
                          >
                            目標金額
                          </label>
                          <input
                            id={`eventAmount-${event.id}`}
                            type="number"
                            inputMode="numeric"
                            className="mt-3 w-full rounded-2xl border border-[rgba(14,31,26,0.15)] px-4 py-3"
                            value={event.targetAmount}
                            onChange={(eventInput) =>
                              handleLifeEventChange(
                                event.id,
                                "targetAmount",
                                Number(eventInput.target.value)
                              )
                            }
                          />
                          {errors[`lifeEvents.${index}.targetAmount`] && (
                            <p className="mt-2 text-xs text-red-600">
                              {errors[`lifeEvents.${index}.targetAmount`]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddLifeEvent}
                  >
                    イベントを追加
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleBack}
            disabled={step === 0}
          >
            前へ
          </Button>
          <div className="flex gap-3">
            {step < stepLabels.length - 1 ? (
              <Button type="button" onClick={handleNext} className="shadow-soft">
                次へ
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} className="shadow-soft">
                結果を見る
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
