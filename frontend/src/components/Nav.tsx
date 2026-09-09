"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Browse" },
  { href: "/recommend", label: "Recommend" },
  { href: "/optimizer", label: "Optimize" },
  { href: "/neighborhoods", label: "Neighborhoods" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 bg-[var(--color-bg)]/90 backdrop-blur-sm border-b border-[var(--color-border)]">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-lg text-[var(--color-text)]"
        >
          Seoul Companion
        </Link>
        <div className="flex gap-1">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[var(--color-surface)] text-[var(--color-text)] font-medium"
                    : "text-[var(--color-text)]/60 hover:text-[var(--color-text)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}