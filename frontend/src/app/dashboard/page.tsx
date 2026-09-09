type Program = {
  id: number;
  name: string;
  university: string;
  cost: number;
  duration_months: number;
  location: string;
  tags: string[];
};

async function getPrograms(): Promise<Program[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/programs`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch programs");
  }

  return res.json();
}

export default async function Dashboard() {
  const programs = await getPrograms();

  return (
    <main className="min-h-screen px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Programs in Seoul</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
          <div
            key={program.id}
            className="border rounded-lg p-5 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-1">{program.name}</h2>
            <p className="text-gray-600 mb-2">{program.university}</p>
            <p className="text-sm text-gray-500 mb-1">
              {program.location} · {program.duration_months} months
            </p>
            <p className="font-medium">
              ₩{program.cost.toLocaleString()}
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {program.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 rounded-full px-2 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}