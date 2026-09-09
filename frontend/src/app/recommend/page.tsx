"use client";

import { useState, useEffect } from "react";
import { MatchRing } from "@/components/MatchRing";

type Program = {
  id: number;
  name: string;
  university: string;
  cost: number;
  duration_months: number;
  location: string;
  tags: string[];
  score: number;
};

export default function Recommend() {
  const [budget, setBudget] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [interests, setInterests] = useState("");
  const [preferredAreas, setPreferredAreas] = useState("");
  const [results, setResults] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem("seoulCompanionUserId");
    if (savedId) {
      setUserId(Number(savedId));
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        budget,
        duration_months: durationMonths,
        interests,
        preferred_areas: preferredAreas,
      });

      const res = await fetch(`http://localhost:8000/recommend?${params}`);

      if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const res = await fetch("http://localhost:8000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget: Number(budget),
          duration_months: Number(durationMonths),
          preferences: `interests: ${interests}; areas: ${preferredAreas}`,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      const data = await res.json();
      setUserId(data.id);
      localStorage.setItem("seoulCompanionUserId", String(data.id));
    } catch (err) {
      setError("Couldn't save your profile. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <h1 className="font-[family-name:var(--font-display)] text-4xl mb-2 text-[var(--color-text)]">
        Find your program
      </h1>
      <p className="text-[var(--color-text)]/70 mb-10">
        Tell us what matters to you, and we&apos;ll rank every program by fit.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        <input
          type="number"
          placeholder="Budget (KRW)"
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
          className="bg-[var(--color-text)] text-[var(--color-surface)] rounded-xl px-6 py-3 font-medium disabled:opacity-50"
        >
          {loading ? "Finding matches..." : "Get recommendations"}
        </button>
      </form>

      <div className="mb-10">
        {userId ? (
          <p className="text-sm text-[var(--color-accent-match)]">
            Profile saved (ID: {userId})
          </p>
        ) : (
          <button
            onClick={handleSaveProfile}
            disabled={saving || !budget || !durationMonths}
            className="text-sm underline text-[var(--color-text)]/60 hover:text-[var(--color-text)] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save this as my profile"}
          </button>
        )}
      </div>

      {error && <p className="text-[var(--color-accent-cost)] mb-6">{error}</p>}

      <div className="flex flex-col gap-4">
        {results.map((program) => (
          <div
            key={program.id}
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 flex items-center gap-5"
          >
            <MatchRing score={program.score} size={64} />
            <div className="flex-1">
              <p className="text-sm text-[var(--color-text)]/60 mb-1">
                {program.university}
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-xl mb-1">
                {program.name}
              </h2>
              <p className="text-sm text-[var(--color-text)]/60">
                {program.location} · {program.duration_months} months ·{" "}
                <span className="font-sans font-medium text-[var(--color-accent-cost)]">
                  ₩{program.cost.toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}