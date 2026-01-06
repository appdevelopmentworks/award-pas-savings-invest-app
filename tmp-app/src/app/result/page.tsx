"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PlanOutput, TodoWithStatus, UserInput } from "@/types/models";
import {
  loadMeta,
  loadPlanOutput,
  loadReminderSettings,
  loadTodos,
  loadUserInput,
  saveReminderSettings,
  saveTodos,
} from "@/lib/storage/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const goalLabelMap: Record<string, string> = {
  FIRST_1M: "まず100万円",
  RETIREMENT: "老後資金",
  EDUCATION: "教育資金",
  HOME: "住宅",
  OTHER: "その他",
};

const lifeEventLabelMap: Record<string, string> = {
  HOUSING: "住宅",
  EDUCATION: "教育",
  MARRIAGE: "結婚・出産",
  CAR: "車",
  TRAVEL: "旅行・留学",
  OTHER: "その他",
};

const formatYen = (value: number) => `¥${Math.round(value).toLocaleString()}`;

export default function ResultPage() {
  const [input, setInput] = useState<UserInput | null>(null);
  const [plan, setPlan] = useState<PlanOutput | null>(null);
  const [todos, setTodos] = useState<TodoWithStatus[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [reminder, setReminder] = useState<ReturnType<typeof loadReminderSettings>>(null);

  useEffect(() => {
    setInput(loadUserInput());
    setPlan(loadPlanOutput());
    setTodos(loadTodos() ?? []);
    setUpdatedAt(loadMeta()?.updatedAt ?? null);
    setReminder(loadReminderSettings());
  }, []);

  const topTodo = todos[0];
  const supportTodos = todos.slice(1);

  const warningMessage = useMemo(() => {
    if (!plan || !input) return null;
    if (plan.monthlySurplusBeforeBuffers < 0) {
      return "支出が手取りを超えています。まずは家計の安定を優先しましょう。";
    }
    if (plan.investCap <= 0) {
      return "今は投資よりも生活防衛資金や特別費の確保が優先です。";
    }
    return null;
  }, [plan, input]);

  const reviewDue = useMemo(() => {
    if (!reminder?.enabled) return false;
    const today = new Date();
    const day = Math.min(Math.max(reminder.dayOfMonth, 1), 28);
    if (today.getDate() < day) return false;
    if (!reminder.lastReviewedAt) return true;
    const last = new Date(reminder.lastReviewedAt);
    return (
      last.getFullYear() !== today.getFullYear() ||
      last.getMonth() !== today.getMonth()
    );
  }, [reminder]);

  const handleReviewDone = () => {
    if (!reminder) return;
    const next = { ...reminder, lastReviewedAt: new Date().toISOString() };
    setReminder(next);
    saveReminderSettings(next);
  };

  const handleTodoToggle = (id: string) => {
    setTodos((prev) => {
      const next = prev.map((todo) =>
        todo.id === id ? { ...todo, checked: !todo.checked } : todo
      );
      saveTodos(next);
      return next;
    });
  };

  if (!input || !plan) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-semibold">結果がまだありません</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          5分の入力で、あなた専用の積立プランを作成します。
        </p>
        <Button asChild className="mt-6 shadow-soft">
          <Link href="/onboarding">入力を始める</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-6 pb-20 pt-8">
      <div className="pointer-events-none absolute -left-40 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(243,201,107,0.35)_0%,_rgba(243,201,107,0)_70%)] blur-3xl" />

      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            PAS Coach Result
          </p>
          <h1 className="mt-3 text-3xl font-semibold">あなたの積立プラン</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {updatedAt
              ? `最終更新: ${new Date(updatedAt).toLocaleString()}`
              : "今月の推奨プラン"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild size="sm" variant="secondary">
            <Link href="/onboarding">入力を更新</Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/settings">設定</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto mt-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {reviewDue && (
            <Card className="bg-[var(--surface-strong)]">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                    Monthly Review
                  </p>
                  <p className="mt-2 font-semibold text-[var(--ink)]">
                    今月の振り返りをしましょう
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    入力を更新して、積立額が今の生活に合っているか確認します。
                  </p>
                </div>
                <Button size="sm" onClick={handleReviewDone}>
                  レビュー完了
                </Button>
              </CardContent>
            </Card>
          )}

          {warningMessage && (
            <Card className="bg-[var(--surface-strong)] text-sm text-[var(--muted)]">
              {warningMessage}
            </Card>
          )}

          {plan.mode === "DEFICIT" && (
            <Card>
              <CardHeader>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Red Mode
                </p>
                <h2 className="text-2xl font-semibold">赤字改善モード</h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--muted)]">
                  毎月の不足は {formatYen(plan.deficitMonthly ?? 0)} です。
                  まずは固定費の見直しや変動費の上限設定から始めましょう。
                </p>
                <div className="mt-4 rounded-2xl border border-[rgba(14,31,26,0.08)] bg-white px-4 py-4 text-sm">
                  目安: 不足額の50%を固定費、50%を変動費で調整すると続けやすいです。
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Card A
              </p>
              <h2 className="text-2xl font-semibold">積立レンジ</h2>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[rgba(14,31,26,0.08)] bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    安全ライン
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatYen(plan.recommendation.safeMonthlyInvest)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    絶対続く金額を最優先
                  </p>
                </div>
                <div className="rounded-2xl border border-[rgba(14,31,26,0.08)] bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    成長ライン
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatYen(plan.recommendation.growthMonthlyInvest)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    慣れたら増額
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="sm">安全ラインで開始</Button>
                <Button size="sm" variant="secondary">
                  成長ラインを目標にする
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Card B
              </p>
              <h2 className="text-2xl font-semibold">なぜこの金額？</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-[var(--muted)]">
                <p>{plan.explanations.formula}</p>
                <p>
                  余剰: {formatYen(plan.monthlySurplusBeforeBuffers)} / 特別費:
                  {formatYen(plan.monthlySpecialExpenseReserve)} / 安全バッファ:
                  {formatYen(plan.monthlySafetyBuffer)}
                </p>
                <p>
                  生活防衛資金目標: {formatYen(plan.emergencyFundTarget)}（{plan.emergencyFundMonths}ヶ月分・不足
                  {formatYen(plan.emergencyFundGap)}）
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[var(--muted)]">
                  {plan.explanations.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Card C
              </p>
              <h2 className="text-2xl font-semibold">3ステップ計画</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-[var(--muted)]">
              <div className="rounded-2xl border border-[rgba(14,31,26,0.08)] bg-white px-4 py-4">
                <p className="text-sm font-semibold text-[var(--ink)]">1. 守る</p>
                <p className="mt-1">
                  防衛資金が足りない場合は、まずそちらを優先。
                </p>
              </div>
              <div className="rounded-2xl border border-[rgba(14,31,26,0.08)] bg-white px-4 py-4">
                <p className="text-sm font-semibold text-[var(--ink)]">
                  2. 小さく始める
                </p>
                <p className="mt-1">
                  安全ライン {formatYen(plan.recommendation.safeMonthlyInvest)} で開始。
                </p>
              </div>
              <div className="rounded-2xl border border-[rgba(14,31,26,0.08)] bg-white px-4 py-4">
                <p className="text-sm font-semibold text-[var(--ink)]">
                  3. 段階増額
                </p>
                <p className="mt-1">
                  {plan.recommendation.increaseEveryMonths}ヶ月ごとに
                  {formatYen(plan.recommendation.increaseStep)}ずつ増額。
                </p>
              </div>
              </div>
            </CardContent>
          </Card>

          {plan.goalProjections && plan.goalProjections.length > 0 && (
            <Card>
              <CardHeader>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Card F
                </p>
                <h2 className="text-2xl font-semibold">目標の見通し</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-[var(--muted)]">
                  {plan.goalProjections.map((goal) => (
                    <div
                      key={goal.id}
                      className="rounded-2xl border border-[rgba(14,31,26,0.08)] bg-white px-4 py-4"
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                        {goal.label || goalLabelMap[goal.type] || "目標"}
                      </p>
                      <p className="mt-2 text-sm">
                        {goal.horizonMonths / 12}年後の見込み:
                        {formatYen(goal.safeInvestProjection)}
                      </p>
                      {goal.targetAmount && (
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          目標: {formatYen(goal.targetAmount)} / 差分:
                          {formatYen(goal.gap ?? 0)}
                        </p>
                      )}
                    </div>
                  ))}
                  <p className="text-xs text-[var(--muted)]">
                    市場リターンは保証できないため、目安としてご覧ください。
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {plan.lifeEventPlans && plan.lifeEventPlans.length > 0 && (
            <Card>
              <CardHeader>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Card G
                </p>
                <h2 className="text-2xl font-semibold">ライフイベント試算</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-[var(--muted)]">
                  {plan.lifeEventPlans.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-[rgba(14,31,26,0.08)] bg-white px-4 py-4"
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                        {event.title ||
                          lifeEventLabelMap[event.type] ||
                          "イベント"}
                      </p>
                      <p className="mt-2 text-sm">
                        {event.horizonMonths / 12}年で必要:
                        {formatYen(event.requiredMonthly)}/月
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        目標総額: {formatYen(event.targetAmount)}
                      </p>
                      {event.shortfall !== undefined && (
                        <p className="mt-1 text-xs text-red-600">
                          安全ラインとの差: {formatYen(event.shortfall)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          {topTodo && (
            <Card>
              <CardHeader>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Card D
                </p>
                <h2 className="text-2xl font-semibold">今月の最優先ToDo</h2>
              </CardHeader>
              <CardContent>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={topTodo.checked}
                    onChange={() => handleTodoToggle(topTodo.id)}
                  />
                  <div>
                    <p className="text-base font-semibold">{topTodo.title}</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {topTodo.why}
                    </p>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[var(--muted)]">
                      {topTodo.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </label>
              </CardContent>
            </Card>
          )}

          {supportTodos.length > 0 && (
            <Card>
              <CardHeader>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Card E
                </p>
                <h2 className="text-2xl font-semibold">補助ToDo</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {supportTodos.map((todo) => (
                  <label key={todo.id} className="flex cursor-pointer gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={todo.checked}
                      onChange={() => handleTodoToggle(todo.id)}
                    />
                    <div>
                      <p className="text-sm font-semibold">{todo.title}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{todo.why}</p>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="bg-[var(--surface-strong)] text-sm text-[var(--muted)]">
            <p>
              投資助言ではなく一般的な情報提供です。最終判断はご自身で行ってください。
            </p>
          </Card>
        </aside>
      </main>
    </div>
  );
}
