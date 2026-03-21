"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/classes", label: "Classes" },
  { href: "/one-on-one", label: "One-on-One" },
  { href: "/lessons", label: "Lessons" },
  { href: "/whiteboard", label: "Whiteboard" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-neutral-200/60 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-[17px] font-semibold tracking-tight text-neutral-900 transition-opacity hover:opacity-70"
        >
          mtjamil.com
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-900"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex flex-col gap-1.5 rounded-lg p-2.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span
            className={`h-0.5 w-5 bg-current transition-transform duration-200 ${mobileMenuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-5 bg-current transition-opacity duration-200 ${mobileMenuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-5 bg-current transition-transform duration-200 ${mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-neutral-200/60 bg-white/95 px-5 py-4 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-0.5">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg py-3 text-[17px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
