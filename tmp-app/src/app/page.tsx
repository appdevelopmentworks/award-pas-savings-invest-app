import { Button } from "@/components/ui/button";

const highlights = [
  {
    title: "安全な積立レンジ",
    body: "手取り・支出・特別費から、無理なく続く金額だけを提示します。",
  },
  {
    title: "3ステップ計画",
    body: "守る→小さく始める→段階増額。初心者向けのシンプル設計。",
  },
  {
    title: "今月の最優先ToDo",
    body: "迷わない行動を1つに絞って提示。チェックで保存できます。",
  },
];

const steps = [
  "手取りと支出をざっくり入力",
  "現金クッションを確認",
  "特別費の目安を選択",
  "目標があれば追加",
  "結果カードで今日の行動が決まる",
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(11,122,111,0.25)_0%,_rgba(11,122,111,0)_70%)] blur-2xl" />
      <div className="pointer-events-none absolute right-[-120px] top-[-80px] h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(243,201,107,0.4)_0%,_rgba(243,201,107,0)_70%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-full opacity-60 grid-mask" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 pb-6 pt-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold uppercase tracking-[0.2em] text-white">
            P
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
              PAS Coach
            </p>
            <p className="text-base font-semibold">積立スタートガイド</p>
          </div>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-[var(--muted)] md:flex">
          <a className="transition hover:text-[var(--ink)]" href="#value">
            価値
          </a>
          <a className="transition hover:text-[var(--ink)]" href="#flow">
            流れ
          </a>
          <a className="transition hover:text-[var(--ink)]" href="#trust">
            安心設計
          </a>
        </nav>
        <Button asChild size="sm" variant="secondary">
          <a href="/onboarding">5分で開始</a>
        </Button>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 pt-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(14,31,26,0.15)] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              MVP for beginners
            </span>
            <h1 className="mt-6 text-balance text-5xl font-semibold leading-tight md:text-6xl">
              いくらなら安心して積み立てられるか、
              迷わない答えを。
            </h1>
            <p className="mt-5 max-w-xl text-base text-[var(--muted)] md:text-lg">
              家計を壊さずに続けられる積立レンジと、今月やるべき最優先ToDoを
              自動で提案します。口座連携もログインも不要。すべて端末内で完結。
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild className="shadow-soft">
                <a href="/onboarding">無料で診断する</a>
              </Button>
              <Button asChild variant="secondary">
                <a href="#flow">使い方を見る</a>
              </Button>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { label: "入力時間", value: "約5分" },
                { label: "保存先", value: "localStorage" },
                { label: "最優先ToDo", value: "必ず1つ" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[rgba(14,31,26,0.08)] bg-white/70 px-4 py-4 text-sm shadow-soft"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-6 -top-8 hidden h-32 w-32 rounded-full border border-dashed border-[rgba(14,31,26,0.2)] md:block animate-[float_8s_ease-in-out_infinite]" />
            <div className="glass rounded-3xl p-6 shadow-soft">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>提案サマリー</span>
                <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-[var(--ink)]">
                  今月版
                </span>
              </div>
              <div className="mt-6 rounded-2xl bg-white px-5 py-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  安全ライン
                </p>
                <p className="mt-2 text-3xl font-semibold">¥12,000</p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  続けることを最優先した低めスタート。
                </p>
              </div>
              <div className="mt-6 rounded-2xl border border-[rgba(14,31,26,0.08)] bg-white/70 px-5 py-5">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  今月の最優先ToDo
                </p>
                <p className="mt-2 text-base font-semibold">
                  特別費の積立を先に設定する
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  突発支出で積立が止まらないための準備です。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="value" className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-4xl font-semibold">安心を先に、積立は後から。</h2>
            <p className="max-w-xl text-[var(--muted)]">
              投資成果を煽らず、毎月の家計が崩れないことを重視します。
            </p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {highlights.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-[rgba(14,31,26,0.08)] bg-white/80 p-6 shadow-soft"
              >
                <h3 className="text-2xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="flow"
          className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-start"
        >
          <div className="rounded-3xl border border-[rgba(14,31,26,0.08)] bg-white/80 p-8 shadow-soft">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              5ステップで完了
            </p>
            <h2 className="mt-4 text-4xl font-semibold">
              迷わない入力フローで、結果まで一直線。
            </h2>
            <p className="mt-4 text-[var(--muted)]">
              ざっくり入力で十分です。あとから修正できるので安心。
            </p>
            <Button asChild className="mt-6">
              <a href="/onboarding">スタートする</a>
            </Button>
          </div>
          <div className="grid gap-4">
            {steps.map((item, index) => (
              <div
                key={item}
                className="flex gap-4 rounded-2xl border border-[rgba(14,31,26,0.08)] bg-white/70 p-5"
              >
                <span className="text-sm font-semibold text-[var(--accent)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-lg font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="trust"
          className="mx-auto w-full max-w-6xl px-6 pb-24"
        >
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-[rgba(14,31,26,0.08)] bg-white/80 px-8 py-10 shadow-soft">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                安心設計
              </p>
              <h2 className="mt-4 text-3xl font-semibold">
                データは端末内のみ。外部送信なし。
              </h2>
            </div>
            <div className="grid gap-3 text-sm text-[var(--muted)]">
              <p>入力データはlocalStorageに保存されます。</p>
              <p>投資助言ではなく一般的な情報提供です。</p>
              <p>ワンクリックでデータ削除が可能です。</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-[rgba(14,31,26,0.08)] px-6 py-8 text-sm text-[var(--muted)]">
        <p>2026 PAS Coach. 安心して続ける積立設計。</p>
        <div className="flex gap-6">
          <a className="transition hover:text-[var(--ink)]" href="/settings">
            免責/プライバシー
          </a>
          <a className="transition hover:text-[var(--ink)]" href="/onboarding">
            はじめる
          </a>
        </div>
        <p className="w-full text-xs text-[var(--muted)] md:w-auto">
          投資助言ではなく一般的な情報提供です。最終判断はご自身で行ってください。
        </p>
      </footer>
    </div>
  );
}
