import type { PlanOutput, Todo, UserInput } from "@/types/models";

const buildTodo = (todo: Todo) => todo;

export const computeTodos = (input: UserInput, plan: PlanOutput): Todo[] => {
  const todos: Todo[] = [];

  const surplus = plan.monthlySurplusBeforeBuffers;
  const specialReserve = plan.monthlySpecialExpenseReserve;

  if (surplus < 0) {
    todos.push(
      buildTodo({
        id: "FIX_CASHFLOW",
        title: "支出を見直して赤字を解消する",
        why: "今は積立よりも家計の安定が最優先だから",
        steps: [
          "固定費を1つだけ削減候補にする",
          "次の給料日までの変動費上限を決める",
        ],
      })
    );
  } else if (plan.emergencyFundGap > 0) {
    todos.push(
      buildTodo({
        id: "BUILD_EMERGENCY",
        title: "生活防衛資金を先に積み上げる",
        why: "急な出費で積立が止まらないようにするため",
        steps: [
          "毎月の余剰の一部を防衛資金口座へ移す",
          "3ヶ月分の生活費を目標にする",
        ],
      })
    );
  } else if (specialReserve <= 0) {
    todos.push(
      buildTodo({
        id: "SET_SPECIAL_RESERVE",
        title: "特別費の積立を先に設定する",
        why: "突発支出があっても積立を継続するため",
        steps: [
          "年額の特別費を決める",
          "月割りで別口座へ自動振替する",
        ],
      })
    );
  }

  if (specialReserve <= 0 && !todos.find((todo) => todo.id === "SET_SPECIAL_RESERVE")) {
    todos.push(
      buildTodo({
        id: "SET_SPECIAL_RESERVE",
        title: "特別費の積立を先に設定する",
        why: "突発支出で投資を止めないため",
        steps: [
          "年にかかる大きめ支出を書き出す",
          "月割り金額で先取りを作る",
        ],
      })
    );
  }

  if (plan.emergencyFundGap > 0 && !todos.find((todo) => todo.id === "BUILD_EMERGENCY")) {
    todos.push(
      buildTodo({
        id: "BUILD_EMERGENCY",
        title: "防衛資金のゴールを決める",
        why: "安心できる現金クッションがあると続けやすい",
        steps: [
          "生活費3ヶ月分を目標にする",
          "自動積立の額を先に確保する",
        ],
      })
    );
  }

  todos.push(
    buildTodo({
      id: "OPEN_ACCOUNT",
      title: "積立口座を開設して自動引落を設定する",
      why: "自動化が最短で習慣化できるから",
      steps: ["口座を開設", "積立日を給料日の翌日に設定"],
    })
  );

  todos.push(
    buildTodo({
      id: "SET_AUTOSAVE",
      title: "積立日と金額を固定する",
      why: "迷わず続けられるようにするため",
      steps: ["安全ラインの金額で開始", "3ヶ月ごとに増額"],
    })
  );

  const uniqueTodos = Array.from(
    new Map(todos.map((todo) => [todo.id, todo])).values()
  );

  return uniqueTodos.slice(0, 4);
};
