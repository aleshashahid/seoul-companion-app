"use client";

import { useState } from "react";

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

  return (
    <main className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Find Your Program</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-10">
        <input
          type="number"
          placeholder="Budget (KRW)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
          className="border rounded-lg px-4 py-2"
        />
        <input
          type="number"
          placeholder="Duration (months)"
          value={durationMonths}
          onChange={(e) => setDurationMonths(e.target.value)}
          required
          className="border rounded-lg px-4 py-2"
        />
        <input
          type="text"
          placeholder="Interests, comma-separated (e.g. stem,business)"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />
        <input
          type="text"
          placeholder="Preferred areas, comma-separated (e.g. Sinchon,Gwanak)"
          value={preferredAreas}
          onChange={(e) => setPreferredAreas(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Finding matches..." : "Get Recommendations"}
        </button>
      </form>

      {error && <p className="text-red-600 mb-6">{error}</p>}

      <div className="flex flex-col gap-4">
        {results.map((program) => (
          <div key={program.id} className="border rounded-lg p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold">{program.name}</h2>
              <span className="text-sm font-medium bg-gray-100 rounded-full px-3 py-1">
                {(program.score * 100).toFixed(0)}% match
              </span>
            </div>
            <p className="text-gray-600">{program.university}</p>
            <p className="text-sm text-gray-500">
              {program.location} · {program.duration_months} months · ₩
              {program.cost.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}