"use client";

import { useState } from "react";
import { MatchRing } from "@/components/MatchRing";

type OptimizeResult = {
  program: {
    name: string;
    university: string;
    cost: number;
    duration_months: number;
    location: string;
  };
  housing: {
    type: string;
    monthly_cost: number;
    location: string;
  };
  total_cost: number;
  remaining_budget: number;
  score: number;
};



export default function Optimizer() {
  const [budget, setBudget] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [interests, setInterests] = useState("");
  const [preferredAreas, setPreferredAreas] = useState("");
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("http://localhost:8000/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_budget: Number(budget),
          duration_months: Number(durationMonths),
          interests: interests ? interests.split(",").map((s) => s.trim()) : [],
          preferred_areas: preferredAreas
            ? preferredAreas.split(",").map((s) => s.trim())
            : [],
        }),
      });

      if (res.status === 404) {
        setError("No affordable combination found. Try a higher budget.");
        return;
      }

      if (!res.ok) {
        throw new Error("Optimization failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <h1 className="font-[family-name:var(--font-display)] text-4xl mb-2 text-[var(--color-text)]">
        Find your best fit
      </h1>
      <p className="text-[var(--color-text)]/70 mb-10">
        One budget, one answer — the best program and housing combination
        that fits.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-12">
        <input
          type="number"
          placeholder="Total budget (KRW)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-match)]"
        />
        <input
          type="number"
          placeholder="Duration (months)"
          value={durationMonths}
          onChange={(e) => setDurationMonths(e.target.value)}
          required
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-match)]"
        />
        <input
          type="text"
          placeholder="Interests (e.g. stem, business)"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-match)]"
        />
        <input
          type="text"
          placeholder="Preferred areas (e.g. Sinchon, Gwanak)"
          value={preferredAreas}
          onChange={(e) => setPreferredAreas(e.target.value)}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-match)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--color-text)] text-[var(--color-surface)] rounded-xl px-6 py-3 font-medium mt-2 disabled:opacity-50"
        >
          {loading ? "Searching combinations..." : "Find my match"}
        </button>
      </form>

      {error && (
        <p className="text-[var(--color-accent-cost)] mb-6">{error}</p>
      )}

      {result && (
        // the "boarding pass" card — program half and housing half,
        // separated by a notched divider
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm">
          <div className="p-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--color-text)]/60 mb-1">
                {result.program.university}
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-2xl mb-1">
                {result.program.name}
              </h2>
              <p className="text-sm text-[var(--color-text)]/60">
                {result.program.location} · {result.program.duration_months} months
              </p>
            </div>
            <MatchRing score={result.score} />
          </div>

          {/* the notched divider — two half-circles cut into the edges,
              mimicking a real ticket's tear-line */}
          <div className="relative flex items-center px-6">
            <div className="flex-1 border-t border-dashed border-[var(--color-border)]" />
          </div>

          <div className="p-6">
            <p className="text-sm text-[var(--color-text)]/60 mb-1">Housing</p>
            <p className="font-medium mb-1">
              {result.housing.type} in {result.housing.location}
            </p>
            <p className="text-sm text-[var(--color-text)]/60">
              ₩{result.housing.monthly_cost.toLocaleString()}/month
            </p>

            <div className="flex gap-6 mt-6 pt-6 border-t border-[var(--color-border)]">
              <div>
                <p className="text-xs text-[var(--color-text)]/60 mb-1">
                  Total cost
                </p>
                <p className="text-lg font-semibold text-[var(--color-accent-cost)]">
                  ₩{result.total_cost.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text)]/60 mb-1">
                  Remaining
                </p>
                <p className="text-lg font-semibold">
                  ₩{result.remaining_budget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}