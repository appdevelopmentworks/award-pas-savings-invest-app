import type {
  PlanOutput,
  ReminderSettings,
  StorageMeta,
  TodoWithStatus,
  UserInput,
} from "@/types/models";
import { STORAGE_VERSION } from "@/lib/constants/defaults";

const buildKey = (name: string) => `pasCoach.${name}.${STORAGE_VERSION}`;

const safeParse = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isUserInput = (value: unknown): value is UserInput => {
  if (!value || typeof value !== "object") return false;
  const input = value as UserInput;
  return (
    isNumber(input.monthlyNetIncome) &&
    isNumber(input.monthlyFixedCost) &&
    isNumber(input.monthlyVariableCost) &&
    isNumber(input.cashSavings) &&
    isNumber(input.monthlyDebtPayment) &&
    isNumber(input.annualSpecialExpense)
  );
};

const isPlanOutput = (value: unknown): value is PlanOutput => {
  if (!value || typeof value !== "object") return false;
  const plan = value as PlanOutput;
  return (
    isNumber(plan.monthlySurplusBeforeBuffers) &&
    isNumber(plan.monthlySpecialExpenseReserve) &&
    isNumber(plan.monthlySafetyBuffer) &&
    isNumber(plan.emergencyFundMonths) &&
    isNumber(plan.emergencyFundTarget) &&
    isNumber(plan.emergencyFundGap) &&
    isNumber(plan.investCap) &&
    isNumber(plan.recommendation?.safeMonthlyInvest) &&
    isNumber(plan.recommendation?.growthMonthlyInvest)
  );
};

const isTodoWithStatus = (value: unknown): value is TodoWithStatus => {
  if (!value || typeof value !== "object") return false;
  const todo = value as TodoWithStatus;
  return (
    typeof todo.id === "string" &&
    typeof todo.title === "string" &&
    typeof todo.why === "string" &&
    Array.isArray(todo.steps) &&
    typeof todo.checked === "boolean"
  );
};

const isStorageMeta = (value: unknown): value is StorageMeta => {
  if (!value || typeof value !== "object") return false;
  const meta = value as StorageMeta;
  return typeof meta.updatedAt === "string" && typeof meta.version === "string";
};

const isReminderSettings = (value: unknown): value is ReminderSettings => {
  if (!value || typeof value !== "object") return false;
  const settings = value as ReminderSettings;
  return (
    typeof settings.enabled === "boolean" &&
    typeof settings.dayOfMonth === "number"
  );
};

const canUseStorage = () => typeof window !== "undefined";

export const saveUserInput = (input: UserInput) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(buildKey("userInput"), JSON.stringify(input));
};

export const loadUserInput = () => {
  if (!canUseStorage()) return null;
  const parsed = safeParse<UserInput>(
    window.localStorage.getItem(buildKey("userInput"))
  );
  return parsed && isUserInput(parsed) ? parsed : null;
};

export const savePlanOutput = (plan: PlanOutput) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(buildKey("planOutput"), JSON.stringify(plan));
};

export const loadPlanOutput = () => {
  if (!canUseStorage()) return null;
  const parsed = safeParse<PlanOutput>(
    window.localStorage.getItem(buildKey("planOutput"))
  );
  if (!parsed || typeof parsed !== "object") return null;
  const normalized = parsed as PlanOutput;
  if (!isNumber(normalized.emergencyFundMonths)) {
    normalized.emergencyFundMonths = 3;
  }
  return isPlanOutput(normalized) ? normalized : null;
};

export const saveTodos = (todos: TodoWithStatus[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(buildKey("todos"), JSON.stringify(todos));
};

export const loadTodos = () => {
  if (!canUseStorage()) return null;
  const parsed = safeParse<TodoWithStatus[]>(
    window.localStorage.getItem(buildKey("todos"))
  );
  if (!parsed || !Array.isArray(parsed)) return null;
  return parsed.every(isTodoWithStatus) ? parsed : null;
};

export const saveMeta = (meta: StorageMeta) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(buildKey("meta"), JSON.stringify(meta));
};

export const loadMeta = () => {
  if (!canUseStorage()) return null;
  const parsed = safeParse<StorageMeta>(
    window.localStorage.getItem(buildKey("meta"))
  );
  return parsed && isStorageMeta(parsed) ? parsed : null;
};

export const saveReminderSettings = (settings: ReminderSettings) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(buildKey("reminder"), JSON.stringify(settings));
};

export const loadReminderSettings = () => {
  if (!canUseStorage()) return null;
  const parsed = safeParse<ReminderSettings>(
    window.localStorage.getItem(buildKey("reminder"))
  );
  return parsed && isReminderSettings(parsed) ? parsed : null;
};

export const clearAllStorage = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(buildKey("userInput"));
  window.localStorage.removeItem(buildKey("planOutput"));
  window.localStorage.removeItem(buildKey("todos"));
  window.localStorage.removeItem(buildKey("meta"));
  window.localStorage.removeItem(buildKey("reminder"));
};

export type ExportPayload = {
  schemaVersion: string;
  userInput?: UserInput;
  planOutput?: PlanOutput;
  todos?: TodoWithStatus[];
  meta?: StorageMeta;
  reminder?: ReminderSettings;
};

export const exportAllData = (): ExportPayload | null => {
  if (!canUseStorage()) return null;
  const payload: ExportPayload = {
    schemaVersion: STORAGE_VERSION,
    userInput: loadUserInput() ?? undefined,
    planOutput: loadPlanOutput() ?? undefined,
    todos: loadTodos() ?? undefined,
    meta: loadMeta() ?? undefined,
    reminder: loadReminderSettings() ?? undefined,
  };
  return payload;
};

export const importAllData = (payload: ExportPayload) => {
  if (!canUseStorage()) return false;
  if (!payload || typeof payload !== "object") return false;
  if (payload.userInput && isUserInput(payload.userInput)) {
    saveUserInput(payload.userInput);
  }
  if (payload.planOutput && isPlanOutput(payload.planOutput)) {
    savePlanOutput(payload.planOutput);
  }
  if (payload.todos && Array.isArray(payload.todos) && payload.todos.every(isTodoWithStatus)) {
    saveTodos(payload.todos);
  }
  if (payload.meta && isStorageMeta(payload.meta)) {
    saveMeta(payload.meta);
  }
  if (payload.reminder && isReminderSettings(payload.reminder)) {
    saveReminderSettings(payload.reminder);
  }
  return true;
};
