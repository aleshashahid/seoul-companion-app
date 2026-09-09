import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-sm text-[var(--color-text)]/60 mb-4 tracking-wide">
        Study abroad in Seoul, planned around your budget
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-5xl mb-6 text-[var(--color-text)] max-w-xl">
        Seoul Companion
      </h1>
      <p className="text-lg text-[var(--color-text)]/70 max-w-md mb-10">
        Find the program, housing, and neighborhood that actually fit your
        budget and interests — not just a list to sort through yourself.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href="/optimizer"
          className="rounded-xl bg-[var(--color-text)] text-[var(--color-surface)] px-6 py-3 font-medium hover:opacity-90 transition-opacity"
        >
          Find my best match
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl border border-[var(--color-border)] text-[var(--color-text)] px-6 py-3 font-medium hover:bg-[var(--color-surface)] transition-colors"
        >
          Browse programs
        </Link>
      </div>
    </main>
  );
}