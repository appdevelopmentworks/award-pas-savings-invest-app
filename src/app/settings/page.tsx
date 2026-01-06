"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  clearAllStorage,
  exportAllData,
  importAllData,
  loadReminderSettings,
  saveReminderSettings,
} from "@/lib/storage/localStorage";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [cleared, setCleared] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDay, setReminderDay] = useState(1);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const stored = loadReminderSettings();
    if (stored) {
      setReminderEnabled(stored.enabled);
      setReminderDay(stored.dayOfMonth);
    }
  }, []);

  const handleClear = () => {
    clearAllStorage();
    setCleared(true);
  };

  const handleExport = () => {
    const payload = exportAllData();
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pas-coach-data.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const ok = importAllData(payload);
      setImportMessage(ok ? "データを取り込みました。" : "読み込みに失敗しました。");
      const stored = loadReminderSettings();
      if (stored) {
        setReminderEnabled(stored.enabled);
        setReminderDay(stored.dayOfMonth);
      }
    } catch {
      setImportMessage("JSONの形式が正しくありません。");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleReminderToggle = (checked: boolean) => {
    setReminderEnabled(checked);
    saveReminderSettings({ enabled: checked, dayOfMonth: reminderDay });
  };

  const handleReminderDayChange = (value: number) => {
    const next = Math.min(Math.max(value, 1), 28);
    setReminderDay(next);
    saveReminderSettings({ enabled: reminderEnabled, dayOfMonth: next });
  };

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-6 pb-20 pt-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            Settings
          </p>
          <h1 className="mt-3 text-3xl font-semibold">設定と免責</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            データの取り扱いとプライバシーについて。
          </p>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link href="/">LPへ戻る</Link>
        </Button>
      </header>

      <section className="mt-10 rounded-3xl border border-[rgba(14,31,26,0.08)] bg-white/85 p-6 shadow-soft">
        <h2 className="text-2xl font-semibold">データ削除</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          端末内に保存された入力・結果・ToDoを削除します。
        </p>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="mt-4"
          onClick={handleClear}
        >
          すべて削除する
        </Button>
        {cleared && (
          <p className="mt-3 text-xs text-[var(--muted)]">
            削除が完了しました。再入力はいつでも可能です。
          </p>
        )}
      </section>

      <section className="mt-8 rounded-3xl border border-[rgba(14,31,26,0.08)] bg-white/85 p-6 shadow-soft">
        <h2 className="text-2xl font-semibold">エクスポート / インポート</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          入力や結果データをJSONで保存・復元できます。
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" size="sm" onClick={handleExport}>
            エクスポート
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => fileRef.current?.click()}
          >
            インポート
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => handleImport(event.target.files?.[0] ?? null)}
        />
        {importMessage && (
          <p className="mt-3 text-xs text-[var(--muted)]">{importMessage}</p>
        )}
      </section>

      <section className="mt-8 rounded-3xl border border-[rgba(14,31,26,0.08)] bg-white/85 p-6 shadow-soft">
        <h2 className="text-2xl font-semibold">月次リマインド</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          毎月の振り返り通知用に、表示タイミングを設定します。
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={reminderEnabled}
              onChange={(event) => handleReminderToggle(event.target.checked)}
            />
            リマインドを有効にする
          </label>
          <div className="flex items-center gap-2 text-sm">
            <span>毎月</span>
            <input
              type="number"
              inputMode="numeric"
              className="w-20 rounded-2xl border border-[rgba(14,31,26,0.15)] px-3 py-2 text-sm"
              value={reminderDay}
              min={1}
              max={28}
              onChange={(event) => handleReminderDayChange(Number(event.target.value))}
            />
            <span>日に表示</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          通知はアプリ内の表示のみです。
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-[rgba(14,31,26,0.08)] bg-white/85 p-6 shadow-soft">
        <h2 className="text-2xl font-semibold">プライバシー</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--muted)]">
          <li>入力データはサーバーに送信されません。</li>
          <li>保存先はlocalStorage（端末内）です。</li>
          <li>共有端末の場合はデータ削除をご利用ください。</li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-[rgba(14,31,26,0.08)] bg-white/85 p-6 shadow-soft">
        <h2 className="text-2xl font-semibold">免責</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--muted)]">
          <li>本サービスは投資助言ではなく一般的な情報提供です。</li>
          <li>将来の成果を保証するものではありません。</li>
          <li>最終判断は利用者ご自身で行ってください。</li>
        </ul>
      </section>
    </div>
  );
}
