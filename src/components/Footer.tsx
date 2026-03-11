import Link from "next/link";

const footerLinks = [
  { href: "/classes", label: "Classes" },
  { href: "/one-on-one", label: "One-on-One" },
  { href: "/lessons", label: "Lessons" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-center">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-neutral-900 transition-opacity hover:opacity-80"
          >
            mtjamil.com
          </Link>
          <ul className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-8 text-center text-sm text-neutral-400 md:mt-12">
          © {currentYear} mtjamil.com. SAT Math tutoring.
        </p>
      </div>
    </footer>
  );
}
