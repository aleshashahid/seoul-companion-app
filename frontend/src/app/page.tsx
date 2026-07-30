import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Seoul Companion</h1>
      <p className="text-lg text-gray-600 max-w-xl mb-8">
        Find the study-abroad program and housing that actually fits your
        budget and interests in Seoul.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-black text-white px-6 py-3 font-medium hover:bg-gray-800"
      >
        Browse Programs
      </Link>
    </main>
  );
}