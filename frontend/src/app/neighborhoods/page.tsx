"use client";

import { useState } from "react";
import { MatchRing } from "@/components/MatchRing";

type Neighborhood = {
  id: number;
  name: string;
  average_monthly_cost: number;
  nightlife_score: number;
  shopping_score: number;
  safety_score: number;
  transit_score: number;
  study_environment_score: number;
  tags: string[];
  match_score: number;
};

// each priority is a 0-1 slider — how much the user cares about that dimension
const PRIORITIES = [
  { key: "nightlife", label: "Nightlife" },
  { key: "shopping", label: "Shopping" },
  { key: "safety", label: "Safety" },
  { key: "transit", label: "Transit" },
  { key: "study", label: "Study environment" },
] as const;

export default function Neighborhoods() {
  // one state value per priority, all starting at 0.5 (neutral)
  const [priorities, setPriorities] = useState<Record<string, number>>({
    nightlife: 0.5,
    shopping: 0.5,
    safety: 0.5,
    transit: 0.5,
    study: 0.5,
  });
  const [results, setResults] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updatePriority(key: string, value: number) {
    // spread the existing object, override just the one key that changed —
    // never mutate state directly, always create a new object
    setPriorities((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSearch() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(priorities).map(([k, v]) => [k, String(v)])
        )
      );
      const res = await fetch(`http://localhost:8000/neighborhoods/match?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <h1 className="font-[family-name:var(--font-display)] text-4xl mb-2 text-[var(--color-text)]">
        Which neighborhood fits you?
      </h1>
      <p className="text-[var(--color-text)]/70 mb-10">
        Tell us what matters most, and we'll rank Seoul's neighborhoods for you.
      </p>

      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 mb-10">
        {PRIORITIES.map(({ key, label }) => (
          <div key={key} className="mb-5 last:mb-0">
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">{label}</label>
              <span className="text-sm text-[var(--color-text)]/60">
                {Math.round(priorities[key] * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={priorities[key]}
              onChange={(e) => updatePriority(key, Number(e.target.value))}
              className="w-full accent-[var(--color-accent-match)]"
            />
          </div>
        ))}

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-[var(--color-text)] text-[var(--color-surface)] rounded-xl px-6 py-3 font-medium mt-6 disabled:opacity-50"
        >
          {loading ? "Ranking neighborhoods..." : "Show my matches"}
        </button>
      </div>

      {error && <p className="text-[var(--color-accent-cost)] mb-6">{error}</p>}

      <div className="flex flex-col gap-4">
        {results.map((n) => (
          <div
            key={n.id}
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 flex items-center gap-5"
          >
            <MatchRing score={n.match_score} size={64} />
            <div className="flex-1">
              <h2 className="font-[family-name:var(--font-display)] text-xl mb-1">
                {n.name}
              </h2>
              <p className="text-sm text-[var(--color-text)]/60 mb-2">
                ₩{n.average_monthly_cost.toLocaleString()}/month avg
              </p>
              <div className="flex gap-2 flex-wrap">
                {n.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-[var(--color-bg)] rounded-full px-2 py-1 text-[var(--color-text)]/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}